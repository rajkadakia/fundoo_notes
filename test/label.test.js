import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Label from '../src/models/label.model.js';
import connectDB from '../src/config/db.js';

describe('Label Routes', () => {
  let token;

  before(async () => {
    await connectDB();
  });

  after(async () => {
    await User.deleteMany({});
    await Label.deleteMany({});
    // await mongoose.connection.close(); 
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Label.deleteMany({});

    const user = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    };
    await request(app).post('/api/v1/auth/register').send(user);
    const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: user.email,
        password: user.password
    });
    token = loginRes.body.token;
  });

  it('should create a new label', async () => {
    const res = await request(app)
      .post('/api/v1/labels')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Label 1' });
    expect(res.status).to.equal(201);
    expect(res.body.name).to.equal('Label 1');
  });

  it('should get all labels', async () => {
    await request(app)
      .post('/api/v1/labels')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Label 1' });
      
    const res = await request(app)
      .get('/api/v1/labels')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(1);
  });
  
  it('should update a label', async () => {
    const labelRes = await request(app)
      .post('/api/v1/labels')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Label 1' });
    const labelId = labelRes.body._id;

    const res = await request(app)
      .put(`/api/v1/labels/${labelId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Label' });
    
    expect(res.status).to.equal(200);
    expect(res.body.name).to.equal('Updated Label');
  });

  it('should delete a label', async () => {
     const labelRes = await request(app)
      .post('/api/v1/labels')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Label 1' });
    const labelId = labelRes.body._id;

    const res = await request(app)
      .delete(`/api/v1/labels/${labelId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('Label removed');
  });
});
