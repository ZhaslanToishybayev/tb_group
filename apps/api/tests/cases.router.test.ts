import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from './helpers/test-server';

describe('Cases Router', () => {
  it('should return a 200 status code', async () => {
    const response = await request(app).get('/api/cases');
    expect(response.status).toBe(200);
  });
});
