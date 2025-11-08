import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

import { ApiError } from '../middleware/error-handler';

export const validateBody = <T>(schema: ZodSchema<T>): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ApiError('Validation failed', 400, 'VALIDATION_ERROR', result.error.flatten()));
      return;
    }
    req.body = result.data as unknown as typeof req.body;
    next();
  };
};

export const validateQuery = <T>(schema: ZodSchema<T>): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ApiError('Validation failed', 400, 'VALIDATION_ERROR', result.error.flatten()));
      return;
    }
    req.query = result.data as unknown as typeof req.query;
    next();
  };
};
