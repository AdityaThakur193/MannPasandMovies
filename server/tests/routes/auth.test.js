const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../../routes/auth');
const User = require('../../models/User');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should fail without name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Name');
    });

    it('should fail with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should fail with short password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('8 characters');
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should trim whitespace from name and email', async () => {
      const userData = {
        name: '  Test User  ',
        email: '  test@example.com  ',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.name).toBe('Test User');
      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'Password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPass123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should fail without email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle email case-insensitively', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'Password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });
  });

  describe('Token Generation', () => {
    it('should generate valid JWT token on registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.body.token).toBeTruthy();
      expect(typeof response.body.token).toBe('string');
      // JWT token format: xxx.yyy.zzz
      expect(response.body.token.split('.')).toHaveLength(3);
    });

    it('should generate valid JWT token on login', async () => {
      // Register first
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123'
        });

      // Login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.body.token).toBeTruthy();
      expect(response.body.token.split('.')).toHaveLength(3);
    });
  });

  describe('Security Tests', () => {
    it('should not return password in response', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.body.user.password).toBeUndefined();
    });

    it('should store hashed password in database', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123'
        });

      const user = await User.findOne({ email: 'test@example.com' }).select('+password');
      expect(user.password).not.toBe('Password123');
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/);
    });
  });
});
