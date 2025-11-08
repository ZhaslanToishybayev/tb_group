import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from './logger';

type ApiErrorPayload = {
  message: string;
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status = 500, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<ApiErrorPayload>,
  _next: NextFunction,
) => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof ApiError) {
    logger.warn({ err }, 'API error');
    res.status(err.status).json({
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ err }, 'Validation error');
    res.status(400).json({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    message: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
  });
};

export default errorHandler;
