import type { RequestHandler } from 'express';

import { ApiError } from './error-handler';
import { verifyAccessToken } from '../modules/auth/auth.service';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new ApiError('Unauthorized', 401, 'UNAUTHORIZED'));
    return;
  }

  const token = header.slice(7);
  try {
    const user = verifyAccessToken(token);
    req.adminUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
