# Deployment Guide - QuickRide

This guide covers deployment to various environments (development, staging, production).

---

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [AWS Deployment](#aws-deployment)
5. [Google Cloud](#google-cloud)
6. [Azure](#azure)
7. [Heroku](#heroku)
8. [Monitoring](#monitoring)
9. [SSL/TLS Setup](#ssltls-setup)
10. [Backup Strategy](#backup-strategy)

---

## 🔧 **Prerequisites**

### Software
- Node.js ≥ 16.x
- MongoDB ≥ 5.0
- Redis ≥ 6.x (optional, for caching)
- Nginx (reverse proxy)
- PM2 (process manager)

### Services
- Firebase project (OTP & FCM)
- Google Maps API key
- Razorpay/Stripe account
- Twilio account (SMS)
- Domain name (production)

---

## 🖥️ **Local Development**

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd quickride
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Admin Dashboard
cd ../admin-dashboard
npm install

# Mobile Apps
cd ../frontend/rider-app
npm install
cd ../driver-app
npm install
```

### 3. Environment Configuration

Create `.env` file in `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/quickride

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSy...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+14155238886

# Client URL
CLIENT_URL=http://localhost:3000

# Commission (15%)
COMMISSION_RATE=0.15
```

### 4. Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Run Backend
```bash
cd backend
npm run dev  # with nodemon (auto-reload)
```

Backend: http://localhost:5000

### 6. Run Admin Dashboard
```bash
cd admin-dashboard
npm run dev
```

Dashboard: http://localhost:3000

### 7. Run Mobile Apps
```bash
# Rider App
cd frontend/rider-app
npx react-native run-android   # Android
npx react-native run-ios       # iOS (requires Mac)

# Driver App
cd ../driver-app
npx react-native run-android
```

---

## 🐳 **Docker Deployment**

### Docker Compose (Recommended)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: quickride-mongo
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./deployment/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secret123
    networks:
      - quickride-network

  redis:
    image: redis:7-alpine
    container_name: quickride-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - quickride-network

  backend:
    build:
      context: ./backend
      dockerfile: ../deployment/Dockerfile.backend
    container_name: quickride-backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:secret123@mongodb:27017/quickride?authSource=admin
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
      FIREBASE_CLIENT_EMAIL: ${FIREBASE_CLIENT_EMAIL}
      FIREBASE_PRIVATE_KEY: ${FIREBASE_PRIVATE_KEY}
      GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY}
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET}
    depends_on:
      - mongodb
      - redis
    networks:
      - quickride-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: quickride-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deployment/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./deployment/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    networks:
      - quickride-network

volumes:
  mongodb_data:
  redis_data:

networks:
  quickride-network:
    driver: bridge
```

### Build & Deploy
```bash
# Set environment variables
export JWT_SECRET=your_jwt_secret
export FIREBASE_PROJECT_ID=xxx
# ... set all required env vars

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## ☁️ **AWS Deployment**

### 1. EC2 Instance Setup

**Launch EC2:**
```bash
# Ubuntu 22.04 LTS, t3.medium (2 vCPU, 4GB RAM)
# Security Groups: 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API)
```

**Connect & Install:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Deploy Application

```bash
# Clone repo
git clone <your-repo>
cd quickride

# Install backend
cd backend
npm ci --only=production
npm run build  # if TypeScript

# Create PM2 ecosystem file
cd ~
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'quickride-backend',
    cwd: '/home/ubuntu/quickride/backend',
    script: 'server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # generate startup script
```

### 3. Configure Nginx

**/etc/nginx/sites-available/quickride:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin Dashboard
    location /admin {
        alias /home/ubuntu/quickride/admin-dashboard/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/quickride /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## 🚀 **Google Cloud Platform**

### Cloud Run (Serverless)

**Dockerfile.backend (optimized):**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
```

**Deploy:**
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/quickride-backend

# Deploy to Cloud Run
gcloud run deploy quickride-backend \
  --image gcr.io/PROJECT_ID/quickride-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "MONGODB_URI=..."

# Get URL
echo $BACKEND_URL
```

---

## 🔷 **Azure Deployment**

### Azure App Service

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Create resource group
az group create --name quickride-rg --location "East US"

# Create App Service plan
az appservice plan create --name quickride-plan --resource-group quickride-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group quickride-rg --plan quickride-plan --name quickride-api --runtime "NODE|18-lts"

# Set environment variables
az webapp config appsettings set --resource-group quickride-rg --name quickride-api --settings MONGODB_URI="..." JWT_SECRET="..."

# Deploy
cd backend
git clone .
git add .
git commit -m "Initial commit"
git push azure master
```

---

## 🎯 **Heroku**

### Backend
```bash
cd backend

# Create Procfile
echo "web: node server.js" > Procfile

# Login & deploy
heroku login
heroku create quickride-api
heroku addons:create mongolab:sandbox

# Set config vars
heroku config:set JWT_SECRET=... FIREBASE_PROJECT_ID=...

# Deploy
git push heroku main
```

---

## 📊 **Monitoring**

### 1. PM2 Monitoring
```bash
pm2 monit
pm2 logs quickride-backend --lines 100
```

### 2. Application Metrics
Use **New Relic** or **Datadog** for APM:

```bash
# Install New Relic agent
npm install newrelic
```

Add to top of `server.js`:
```javascript
require('newrelic');
```

### 3. Log Management

**Winston already configured** → logs stored in:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

Send to external service:
- Loggly
- Papertrail
- AWS CloudWatch

### 4. Health Checks

**Endpoint:** `GET /health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Configure uptime monitoring (UptimeRobot, Pingdom).

---

## 🔒 **SSL/TLS Setup**

### Nginx + Let's Encrypt (Already covered)
### CloudFlare SSL
1. Change nameservers to CloudFlare
2. Enable "Flexible SSL" or "Full SSL"
3. Configure page rules for caching

---

## 💾 **Backup Strategy**

### 1. Database Backup (MongoDB)

**Daily cron job on server:**
```bash
crontab -e

# Add line
0 2 * * * /usr/bin/mongodump --uri="mongodb://localhost:27017/quickride" --out="/backup/quickride-$(date +\%Y-\%m-\%d)"
```

**Upload to S3:**
```bash
0 3 * * * aws s3 cp /backup/ s3://your-bucket/backups/ --recursive --exclude "*" --include "quickride-*"
```

### 2. File Storage Backup
If using S3 for images/documents → enable versioning.

### 3. Environment Variables Backup
Store `.env` in secure vault (AWS Secrets Manager, HashiCorp Vault).

---

## ⚡ **Performance Optimization**

### 1. Database Indexes
Ensure all query fields are indexed:
```javascript
// Already defined in models
userSchema.index({ phone: 1 });
rideSchema.index({ rider: 1, createdAt: -1 });
rideSchema.index({ 'pickup.location': '2dsphere' });
```

### 2. Redis Caching
Cache frequently accessed data:
```javascript
// User profile
await redis.setex(`user:${userId}`, 3600, JSON.stringify(profile));
```

### 3. CDN for Static Assets
- Upload profile photos to CloudFlare R2 or AWS S3
- Serve via CDN

### 4. Load Balancing
For high traffic:
- Use **NGINX** as reverse proxy with multiple backend instances
- Use **PM2 cluster mode** (already configured)

---

## 🔄 **CI/CD Pipeline**

### GitHub Actions Example

```yaml
name: Deploy QuickRide

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm ci && npm test

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/quickride
            git pull origin main
            cd backend && npm ci --production
            pm2 reload quickride-backend

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v2
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/quickride
            git pull origin main
            cd backend && npm ci --production
            pm2 reload quickride-backend
```

---

## 🚨 **Disaster Recovery**

1. **Database snapshots** every 6 hours
2. **Point-in-time recovery** enabled on RDS/MongoDB Atlas
3. **Multi-region replication** for critical deployments
4. **Blue-green deployment** strategy for zero-downtime updates

---

## 📋 **Pre-deployment Checklist**

- [ ] All environment variables set
- [ ] SSL certificates installed
- [ ] Database indexes created
- [ ] Monitoring tools configured
- [ ] Log aggregation set up
- [ ] Backup strategy implemented
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Security headers (Helmet.js) enabled
- [ ] Error tracking (Sentry) set up
- [ ] Load testing completed
- [ ] Documentation updated

---

## 🚀 **Zero-Downtime Deployment**

### Using PM2
```bash
pm2 reload quickride-backend --update-env
```

### Using Docker
```bash
# Deploy new image
docker-compose pull
docker-compose up -d --no-deps backend

# Or use rolling update
docker service update --image new-image:tag quickride_backend
```

---

## 📈 **Scaling**

### Horizontal Scaling
```bash
# PM2 cluster mode (already in Dockerfile)
pm2 scale quickride-backend 4

# Kubernetes deployment
kubectl scale deployment quickride-backend --replicas=4
```

### Database Scaling
- Read replicas for high read traffic
- Sharding by `city` or `rideId` for massive scale

---

## 🔐 **Security Checklist**

- [x] HTTPS enforced
- [x] Helmet.js security headers
- [x] Rate limiting per IP
- [x] Input validation/sanitization
- [x] SQL/NoSQL injection prevention
- [x] JWT with strong secret
- [x] CORS whitelisted
- [x] Environment variables secured
- [x] Dependencies audited (npm audit)
- [x] Docker images scanned
- [ ] WAF (Web Application Firewall) configured
- [ ] DDoS protection enabled

---

## 📞 **Support**

Deployment issues? Contact DevOps team at:
**devops@quickride.com**

---

> **Note:** This deployment guide covers common platforms. Adapt configurations based on your specific infrastructure requirements and compliance needs.