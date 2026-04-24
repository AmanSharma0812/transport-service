const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('API Health Check', () => {
  it('should return healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
  });
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register/rider', () => {
    it('should register a new rider', async () => {
      const res = await request(app)
        .post('/api/auth/register/rider')
        .send({
          name: 'Test Rider',
          email: 'rider@test.com',
          phone: '+919876543210',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });
  });
});

describe('Rider Routes (Protected)', () => {
  let token;

  beforeAll(async () => {
    // Login and get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rider@test.com',
        password: 'password123'
      });
    token = res.body.token;
  });

  it('should get fare estimate', async () => {
    const res = await request(app)
      .get('/api/rider/estimate-fare?pickupLat=12.9716&pickupLng=77.5946&dropoffLat=12.9352&dropoffLng=77.6245&vehicleType=bike')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('baseFare');
    expect(res.body.data).toHaveProperty('total');
  });
});