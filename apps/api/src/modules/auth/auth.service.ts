import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import prisma from '../../lib/prisma';
import env from '../../config/env';
import { ApiError } from '../../middleware/error-handler';
import {
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from './token-service';
import type { AuthResponse, AuthUser } from './auth.types';

const ACCESS_TOKEN_EXP = '15m';

const toAuthUser = (admin: { id: string; email: string; displayName: string | null; role: string }): AuthUser => ({
  id: admin.id,
  email: admin.email,
  displayName: admin.displayName,
  role: admin.role,
});

const createAccessToken = (admin: AuthUser) => {
  return jwt.sign(
    {
      sub: admin.id,
      email: admin.email,
      displayName: admin.displayName,
      role: admin.role,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXP },
  );
};

const refreshExpiryDate = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXP_DAYS);
  return expiresAt;
};

export const loginWithCredentials = async (email: string, password: string): Promise<AuthResponse> => {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await argon2.verify(admin.passwordHash, password);
  if (!valid) {
    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const authUser = toAuthUser(admin);
  const accessToken = createAccessToken(authUser);
  const { token: refreshToken } = await issueRefreshToken(admin.id, refreshExpiryDate());

  return {
    accessToken,
    refreshToken,
    user: authUser,
  };
};

export const refreshTokens = async (refreshToken: string): Promise<AuthResponse> => {
  const existing = await verifyRefreshToken(refreshToken);
  if (!existing) {
    throw new ApiError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: existing.adminUserId } });
  if (!admin) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }

  const next = await rotateRefreshToken(existing.id, existing.adminUserId, refreshExpiryDate());

  const authUser = toAuthUser(admin);
  const accessToken = createAccessToken(authUser);

  return {
    accessToken,
    refreshToken: next.token,
    user: authUser,
  };
};

export const logoutWithToken = async (refreshToken: string): Promise<void> => {
  await revokeRefreshToken(refreshToken);
};

export const verifyAccessToken = (token: string): AuthUser => {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    return {
      id: payload.sub as string,
      email: payload.email as string,
      displayName: (payload.displayName as string | undefined) ?? null,
      role: (payload.role as string) ?? 'ADMIN',
    };
  } catch (error) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED', error);
  }
};
