/**
 * Unit tests for validation utilities
 *
 * Tests the Zod-based validation middleware functions:
 * - validateBody: Validates request body against Zod schema
 * - validateQuery: Validates query parameters against Zod schema
 */

import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validateBody, validateQuery } from './validate';

// Mock Express types
type MockRequest = Partial<Request> & {
  body?: any;
  query?: any;
};

describe('validateBody', () => {
  it('should pass validation when body matches schema', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: { name: 'John Doe', email: 'john@example.com' },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'John Doe', email: 'john@example.com' });
  });

  it('should transform body when validation succeeds', () => {
    const schema = z.object({
      age: z.number(),
      isActive: z.boolean(),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: { age: '25', isActive: 'true' }, // String inputs that will be coerced
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({ age: 25, isActive: true });
  });

  it('should reject validation when body is missing required fields', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: { name: 'John Doe' }, // Missing email
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Validation failed');
  });

  it('should reject validation when body has invalid data types', () => {
    const schema = z.object({
      age: z.number(),
      email: z.string().email(),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: { age: 'not-a-number', email: 'invalid-email' },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject validation when body is completely invalid', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: { name: 123, email: null }, // Completely wrong types
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle nested object validation', () => {
    const schema = z.object({
      user: z.object({
        name: z.string().min(1),
        address: z.object({
          city: z.string(),
          zipCode: z.string().length(5),
        }),
      }),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: {
        user: {
          name: 'John Doe',
          address: {
            city: 'New York',
            zipCode: '10001',
          },
        },
      },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(req.body.user.address.city).toBe('New York');
  });

  it('should reject nested object validation errors', () => {
    const schema = z.object({
      user: z.object({
        name: z.string().min(1),
        age: z.number().min(18),
      }),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: {
        user: {
          name: 'John Doe',
          age: 16, // Below minimum
        },
      },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle array validation', () => {
    const schema = z.object({
      tags: z.array(z.string().min(1)),
      scores: z.array(z.number().min(0).max(100)),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: {
        tags: ['javascript', 'typescript', 'nodejs'],
        scores: [85, 92, 78],
      },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(req.body.tags).toEqual(['javascript', 'typescript', 'nodejs']);
    expect(req.body.scores).toEqual([85, 92, 78]);
  });

  it('should reject invalid array items', () => {
    const schema = z.object({
      tags: z.array(z.string().min(1)),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: {
        tags: ['valid', '', 'also-valid'], // Empty string should fail
      },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
  });

  it('should handle optional fields correctly', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      age: z.number().optional(),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: { name: 'John Doe' }, // Only required field
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'John Doe' });
  });

  it('should handle union types', () => {
    const schema = z.object({
      status: z.union([z.string(), z.number()]),
      priority: z.enum(['low', 'medium', 'high']),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: { status: 'active', priority: 'high' },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body.status).toBe('active');
    expect(req.body.priority).toBe('high');
  });

  it('should preserve original request body on validation failure', () => {
    const schema = z.object({
      name: z.string().min(1),
    });

    const handler = validateBody(schema);
    const originalBody = { name: 123, extra: 'field' };
    const req: MockRequest = {
      body: originalBody,
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    // Request body should remain unchanged on failure
    expect(req.body).toBe(originalBody);
    expect(req.body).toEqual({ name: 123, extra: 'field' });
  });
});

describe('validateQuery', () => {
  it('should pass validation when query matches schema', () => {
    const schema = z.object({
      page: z.coerce.number().min(1),
      limit: z.coerce.number().min(1).max(100),
      sort: z.string().optional(),
    });

    const handler = validateQuery(schema);
    const req: MockRequest = {
      query: { page: '1', limit: '10', sort: 'name' },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(req.query).toEqual({ page: 1, limit: 10, sort: 'name' });
  });

  it('should reject invalid query parameters', () => {
    const schema = z.object({
      page: z.coerce.number().min(1),
      limit: z.coerce.number().min(1).max(100),
    });

    const handler = validateQuery(schema);
    const req: MockRequest = {
      query: { page: '0', limit: '150' }, // page < 1, limit > 100
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle empty query object', () => {
    const schema = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
    });

    const handler = validateQuery(schema);
    const req: MockRequest = {
      query: {}, // Empty query
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.query).toEqual({ page: 1, limit: 10 });
  });

  it('should handle query parameter transformations', () => {
    const schema = z.object({
      ids: z.string().transform((str) => str.split(',').map(Number)).refine(arr => arr.length > 0, 'Must have at least one ID'),
      active: z.coerce.boolean(),
    });

    const handler = validateQuery(schema);
    const req: MockRequest = {
      query: { ids: '1,2,3', active: 'true' },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.query.ids).toEqual([1, 2, 3]);
    expect(req.query.active).toBe(true);
  });

  it('should reject query with unexpected parameters', () => {
    const schema = z.object({
      page: z.coerce.number().min(1),
    });

    const handler = validateQuery(schema);
    const req: MockRequest = {
      query: { page: '1', unexpected: 'value' },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle search query with filters', () => {
    const schema = z.object({
      q: z.string().min(1).max(100),
      category: z.string().optional(),
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      inStock: z.coerce.boolean().optional(),
    });

    const handler = validateQuery(schema);
    const req: MockRequest = {
      query: {
        q: 'laptop',
        category: 'electronics',
        minPrice: '500',
        maxPrice: '2000',
        inStock: 'true',
      },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.query).toEqual({
      q: 'laptop',
      category: 'electronics',
      minPrice: 500,
      maxPrice: 2000,
      inStock: true,
    });
  });

  it('should handle date range queries', () => {
    const schema = z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    });

    const handler = validateQuery(schema);
    const req: MockRequest = {
      query: {
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T23:59:59.999Z',
      },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.query.startDate).toBe('2023-01-01T00:00:00.000Z');
    expect(req.query.endDate).toBe('2023-12-31T23:59:59.999Z');
  });

  it('should reject invalid date formats', () => {
    const schema = z.object({
      date: z.string().datetime(),
    });

    const handler = validateQuery(schema);
    const req: MockRequest = {
      query: { date: 'not-a-date' },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});

// Integration tests for error handling
describe('validateBody & validateQuery Error Handling', () => {
  it('should handle Zod validation errors with proper ApiError structure', () => {
    const schema = z.object({
      name: z.string().min(1),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: { name: '' }, // Empty string should fail min length
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;

    // Verify ApiError structure
    expect(error).toHaveProperty('message', 'Validation failed');
    expect(error).toHaveProperty('status', 400);
    expect(error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(error).toHaveProperty('details');
  });

  it('should preserve Zod error details in ApiError', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    const handler = validateBody(schema);
    const req: MockRequest = {
      body: { email: 'invalid-email', age: 16 },
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;
    expect(error).toHaveProperty('details');
    expect(error.details).toHaveProperty('fieldErrors');
  });

  it('should not modify request object when validation fails', () => {
    const schema = z.object({
      required: z.string().min(1),
    });

    const handler = validateBody(schema);
    const originalBody = { required: '', other: 'value' };
    const req: MockRequest = {
      body: originalBody,
    };
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    handler(req as Request, res, next);

    // Body should remain unchanged on validation failure
    expect(req.body).toBe(originalBody);
    expect(req.body).toEqual({ required: '', other: 'value' });
  });
});
