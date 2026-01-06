import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

describe('App Test', () => {
  it('should return 200 OK for GET /', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('FundooNotes API is running...');
  });
});
