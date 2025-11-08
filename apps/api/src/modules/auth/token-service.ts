import crypto from 'node:crypto';

import prisma from '../../lib/prisma';

const TOKEN_BYTE_SIZE = 48;

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateToken = (): string => {
  return crypto.randomBytes(TOKEN_BYTE_SIZE).toString('base64url');
};

export const issueRefreshToken = async (
  adminUserId: string,
  expiresAt: Date,
) => {
  const token = generateToken();
  const tokenHash = hashToken(token);

  const record = await prisma.refreshToken.create({
    data: {
      tokenHash,
      adminUserId,
      expiresAt,
    },
  });

  return { token, record };
};

export const verifyRefreshToken = async (token: string) => {
  const tokenHash = hashToken(token);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    return null;
  }

  return record;
};

export const rotateRefreshToken = async (
  existingTokenId: string,
  adminUserId: string,
  expiresAt: Date,
) => {
  const { token: newToken, record } = await issueRefreshToken(adminUserId, expiresAt);

  await prisma.refreshToken.update({
    where: { id: existingTokenId },
    data: {
      revokedAt: new Date(),
      replacedById: record.id,
    },
  });

  return { token: newToken, record };
};

export const revokeRefreshToken = async (token: string) => {
  const tokenHash = hashToken(token);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });
};

export const revokeTokenById = async (tokenId: string) => {
  await prisma.refreshToken.updateMany({
    where: { id: tokenId },
    data: { revokedAt: new Date() },
  });
};
