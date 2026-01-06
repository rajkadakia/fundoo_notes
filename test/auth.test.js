import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import connectDB from '../src/config/db.js';

describe('Auth Routes', () => {
  before(async () => {

    await connectDB();
  });

  after(async () => {
   
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {

    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser);

      expect(res.status).to.equal(201);
    
      
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('email', newUser.email);
      expect(res.body).to.have.property('token');
    });

    it('should not register a user with existing email', async () => {
      const user = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      };

      await User.create(user);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(user);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'User already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login a registered user', async () => {
      const user = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app).post('/api/v1/auth/register').send(user);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.password
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('email', user.email);
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('message', 'Invalid email or password');
    });
  });
});
