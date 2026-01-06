import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import Note from '../src/models/note.model.js';
import User from '../src/models/user.model.js';
import Label from '../src/models/label.model.js';
import { redisClient } from '../src/config/redis.config.js';

describe('Note API with Redis Caching', () => {
  let authToken;
  let userId;
  let labelId;

  before(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});
    await Label.deleteMany({});

    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = userRes.body.token;
    userId = userRes.body._id;

    const labelRes = await request(app)
      .post('/api/v1/labels')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Work' });

    labelId = labelRes.body._id;
  });

  after(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});
    await Label.deleteMany({});
    if (redisClient.isOpen) {
      await redisClient.flushAll();
    }
  });

  describe('POST /api/v1/notes', () => {
    it('should create a new note and invalidate cache', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Note',
          description: 'Test Description',
          color: '#ffffff',
          isArchived: false,
          isTrash: false,
          isPinned: false
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('title', 'Test Note');
      expect(res.body).to.have.property('description', 'Test Description');
      expect(res.body).to.have.property('isPinned', false);
    });
  });

  describe('GET /api/v1/notes', () => {
    before(async () => {
      await Note.deleteMany({});
      for (let i = 1; i <= 25; i++) {
        await request(app)
          .post('/api/v1/notes')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: `Note ${i}`,
            description: `Description ${i}`,
            isArchived: false,
            isTrash: false
          });
      }
    });

    it('should get all notes with pagination (first 20)', async () => {
      const res = await request(app)
        .get('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(20);
    });

    it('should cache the results', async () => {
      const res1 = await request(app)
        .get('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`);

      const res2 = await request(app)
        .get('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res1.body).to.deep.equal(res2.body);
    });

    it('should get second page of notes', async () => {
      const res = await request(app)
        .get('/api/v1/notes?page=2&limit=20')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(5);
    });
  });

  describe('GET /api/v1/notes/archived', () => {
    before(async () => {
      await Note.deleteMany({});
      await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Archived Note',
          description: 'Archived Description',
          isArchived: true,
          isTrash: false
        });

      await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Regular Note',
          description: 'Regular Description',
          isArchived: false,
          isTrash: false
        });
    });

    it('should get only archived notes', async () => {
      const res = await request(app)
        .get('/api/v1/notes/archived')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1);
      expect(res.body[0]).to.have.property('isArchived', true);
    });
  });

  describe('GET /api/v1/notes/trash', () => {
    before(async () => {
      await Note.deleteMany({});
      await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Trashed Note',
          description: 'Trashed Description',
          isArchived: false,
          isTrash: true
        });

      await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Regular Note',
          description: 'Regular Description',
          isArchived: false,
          isTrash: false
        });
    });

    it('should get only trashed notes', async () => {
      const res = await request(app)
        .get('/api/v1/notes/trash')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1);
      expect(res.body[0]).to.have.property('isTrash', true);
    });
  });

  describe('GET /api/v1/notes/label/:labelId', () => {
    before(async () => {
      await Note.deleteMany({});
      await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Labeled Note',
          description: 'Labeled Description',
          labels: [labelId],
          isTrash: false
        });

      await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Unlabeled Note',
          description: 'Unlabeled Description',
          isTrash: false
        });
    });

    it('should get notes by label', async () => {
      const res = await request(app)
        .get(`/api/v1/notes/label/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1);
      expect(res.body[0]).to.have.property('title', 'Labeled Note');
    });
  });

  describe('PUT /api/v1/notes/:id/pin', () => {
    let noteId;

    before(async () => {
      await Note.deleteMany({});
      const noteRes = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Note to Pin',
          description: 'Pin Description',
          isPinned: false
        });

      noteId = noteRes.body._id;
    });

    it('should toggle pin status', async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${noteId}/pin`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('isPinned', true);

      const res2 = await request(app)
        .put(`/api/v1/notes/${noteId}/pin`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res2.status).to.equal(200);
      expect(res2.body).to.have.property('isPinned', false);
    });
  });

  describe('PUT /api/v1/notes/:id', () => {
    let noteId;

    before(async () => {
      await Note.deleteMany({});
      const noteRes = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Title',
          description: 'Original Description'
        });

      noteId = noteRes.body._id;
    });

    it('should update note and invalidate cache', async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description',
          isPinned: true
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('title', 'Updated Title');
      expect(res.body).to.have.property('description', 'Updated Description');
      expect(res.body).to.have.property('isPinned', true);
    });
  });

  describe('DELETE /api/v1/notes/:id', () => {
    let noteId;

    before(async () => {
      await Note.deleteMany({});
      const noteRes = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Note to Delete',
          description: 'Delete Description'
        });

      noteId = noteRes.body._id;
    });

    it('should delete note and invalidate cache', async () => {
      const res = await request(app)
        .delete(`/api/v1/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Note removed');

      const getRes = await request(app)
        .get(`/api/v1/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).to.equal(404);
    });
  });
});
