const request = require('supertest');

jest.mock('../src/config/database', () => ({
  connectDB: jest.fn(),
}));

jest.mock('../src/config/redis', () => ({
  connectRedis: jest.fn(),
  cacheMiddleware: () => (_req, _res, next) => next(),
  invalidateCache: jest.fn(),
  getRedisClient: () => null,
}));

const { app, server } = require('../src/app');

describe('Health Endpoints', () => {
  it('GET /api/health should return success', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Server is running');
  });

  it('GET /api/health/ready should return success', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Server is ready');
  });
});

describe('404 Handling', () => {
  it('GET /api/nonexistent should return 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not found');
  });
});

describe('Validation', () => {
  it('POST /api/auth/register with invalid body should return 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation error');
  });
});

describe('Authentication', () => {
  it('GET /api/auth/profile without token should return 401', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

afterAll((done) => {
  if (server) {
    server.close(() => {
      done();
    });
  } else {
    done();
  }
});
