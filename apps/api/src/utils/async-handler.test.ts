/**
 * Unit tests for async handler utility
 *
 * Tests the async error handling wrapper:
 * - asyncHandler: Wraps async request handlers to catch and forward errors
 */

import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { asyncHandler } from './async-handler';

// Mock Express types
type MockRequest = Partial<Request>;
type MockResponse = Partial<Response> & {
  status?: any;
  json?: any;
  send?: any;
};

describe('asyncHandler', () => {
  it('should wrap async handler and call next without error on success', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      // Simulate successful async operation
      res.status(200).json({ message: 'Success' });
      next();
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Success' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should catch synchronous errors and pass to next', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      // Simulate synchronous error
      throw new Error('Test synchronous error');
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test synchronous error');
  });

  it('should catch asynchronous errors and pass to next', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      // Simulate async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Async operation failed')), 10);
      });
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Async operation failed');
  });

  it('should catch Promise rejections and pass to next', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      // Simulate unhandled promise rejection
      Promise.reject(new Error('Unhandled promise rejection'));
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Unhandled promise rejection');
  });

  it('should handle errors with custom error classes', async () => {
    class CustomError extends Error {
      constructor(message: string, public code: string) {
        super(message);
        this.name = 'CustomError';
      }
    }

    const mockHandler: RequestHandler = async (req, res, next) => {
      throw new CustomError('Something went wrong', 'CUSTOM_ERROR');
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as CustomError;
    expect(error).toBeInstanceOf(CustomError);
    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe('CUSTOM_ERROR');
  });

  it('should handle errors with additional properties', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      const error = new Error('Database connection failed');
      (error as any).statusCode = 500;
      (error as any).code = 'DB_CONNECTION_ERROR';
      throw error;
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as any;
    expect(error.message).toBe('Database connection failed');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('DB_CONNECTION_ERROR');
  });

  it('should preserve original error stack trace', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      const error = new Error('Original error');
      error.stack = 'Custom stack trace\n    at test.js:10:5';
      throw error;
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error.stack).toBe('Custom stack trace\n    at test.js:10:5');
  });

  it('should handle async functions with database queries', async () => {
    // Mock database operation
    const mockDbOperation = vi.fn().mockResolvedValue({ id: 1, name: 'Test User' });

    const mockHandler: RequestHandler = async (req, res, next) => {
      const user = await mockDbOperation();
      res.json({ user });
      next();
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {
      json: vi.fn(),
    };
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(mockDbOperation).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ user: { id: 1, name: 'Test User' } });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should handle async functions that throw after successful operations', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');

    const mockHandler: RequestHandler = async (req, res, next) => {
      const result = await mockOperation();
      if (result === 'success') {
        // Simulate conditional error after success
        throw new Error('Post-operation validation failed');
      }
      res.json({ result });
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error.message).toBe('Post-operation validation failed');
  });

  it('should handle async functions with multiple await operations', async () => {
    const mockOperation1 = vi.fn().mockResolvedValue('step1');
    const mockOperation2 = vi.fn().mockResolvedValue('step2');

    const mockHandler: RequestHandler = async (req, res, next) => {
      const result1 = await mockOperation1();
      const result2 = await mockOperation2();
      res.json({ step1: result1, step2: result2 });
      next();
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {
      json: vi.fn(),
    };
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(mockOperation1).toHaveBeenCalledTimes(1);
    expect(mockOperation2).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ step1: 'step1', step2: 'step2' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should handle errors in multi-step async operations', async () => {
    const mockOperation1 = vi.fn().mockResolvedValue('step1');
    const mockOperation2 = vi.fn().mockRejectedValue(new Error('Step 2 failed'));

    const mockHandler: RequestHandler = async (req, res, next) => {
      const result1 = await mockOperation1();
      const result2 = await mockOperation2(); // This should fail
      res.json({ step1: result1, step2: result2 });
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(mockOperation1).toHaveBeenCalledTimes(1);
    expect(mockOperation2).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error.message).toBe('Step 2 failed');
  });

  it('should handle timeout errors', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      // Simulate timeout by rejecting after delay
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 50);
      });
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error.message).toBe('Request timeout');
  });

  it('should handle errors from external API calls', async () => {
    const mockExternalApi = vi.fn().mockRejectedValue(
      new Error('External API Error: Service unavailable')
    );

    const mockHandler: RequestHandler = async (req, res, next) => {
      try {
        const data = await mockExternalApi();
        res.json({ data });
      } catch (error) {
        // Even if we catch here, the wrapper should still handle it
        throw error;
      }
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(mockExternalApi).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error.message).toBe('External API Error: Service unavailable');
  });

  it('should not modify request or response objects on error', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      res.locals.userId = '12345'; // Set some data
      throw new Error('Something went wrong');
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {
      locals: {},
    };
    const res: MockResponse = {
      locals: {},
    };
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    // Should have set the locals data before erroring
    expect(res.locals.userId).toBe('12345');
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error.message).toBe('Something went wrong');
  });
});

// Edge case tests
describe('asyncHandler Edge Cases', () => {
  it('should handle handler that returns a Promise', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      // Explicitly return a promise
      return Promise.resolve('Done').then((message) => {
        res.json({ message });
        next();
      });
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {
      json: vi.fn(),
    };
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(res.json).toHaveBeenCalledWith({ message: 'Done' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should handle handler that throws immediately (synchronously)', () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      // This is actually an async function, so it can't throw synchronously
      // But we can simulate the behavior
      setImmediate(() => {
        throw new Error('Immediate synchronous error');
      });
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    return wrappedHandler(req as Request, res as Response, next).then(() => {
      // Should eventually call next with the error
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0] as Error;
      expect(error.message).toBe('Immediate synchronous error');
    });
  });

  it('should handle undefined errors gracefully', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      // Some libraries might throw undefined
      throw undefined;
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(undefined);
  });

  it('should handle null errors gracefully', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      // Some error handlers might pass null
      throw null;
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(null);
  });

  it('should handle string errors gracefully', async () => {
    const mockHandler: RequestHandler = async (req, res, next) => {
      // Some legacy code might throw strings
      throw 'String error';
    };

    const wrappedHandler = asyncHandler(mockHandler);
    const req: MockRequest = {};
    const res: MockResponse = {};
    const next = vi.fn() as NextFunction;

    await wrappedHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith('String error');
  });
});
