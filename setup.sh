#!/bin/bash

# QuickRide Setup Script
# Run this script to quickly set up the development environment

set -e

echo "🚀 QuickRide Setup Starting..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ first.${NC}"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB not found. Make sure MongoDB is installed and running.${NC}"
fi

# Function to run commands in directory
run_cmd() {
    echo -e "${GREEN}📦 $1${NC}"
    eval "$2" || exit 1
}

# Install backend dependencies
run_cmd "Installing backend dependencies..." "cd backend && npm install"

# Install admin dashboard dependencies
run_cmd "Installing admin dashboard..." "cd admin-dashboard && npm install"

# Install rider app dependencies
run_cmd "Installing rider app..." "cd frontend/rider-app && npm install"

# Install driver app dependencies
run_cmd "Installing driver app..." "cd frontend/driver-app && npm install"

# Create backend .env if doesn't exist
if [ ! -f backend/.env ]; then
    echo -e "${GREEN}📝 Creating backend .env file...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Please update backend/.env with your configuration values.${NC}"
fi

# Create logs directory
mkdir -p backend/logs

# Create SSL directory
mkdir -p deployment/ssl

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your API keys"
echo "   - Firebase credentials"
echo "   - Google Maps API key"
echo "   - Razorpay keys"
echo "   - Twilio credentials"
echo ""
echo "2. Start MongoDB:"
echo "   brew services start mongodb-community   # macOS"
echo "   sudo systemctl start mongod             # Linux"
echo ""
echo "3. Run the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "4. Run the admin dashboard:"
echo "   cd admin-dashboard && npm run dev"
echo ""
echo "5. Run mobile apps:"
echo "   cd frontend/rider-app && npx react-native run-android"
echo "   cd frontend/driver-app && npx react-native run-android"
echo ""
echo "📚 Documentation:"
echo "   - README.md       : Project overview"
echo "   - docs/API.md     : API documentation"
echo "   - docs/DEPLOYMENT.md : Deployment guide"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"