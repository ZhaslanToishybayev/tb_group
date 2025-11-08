import type { AdminUser } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      adminUser?: Pick<AdminUser, 'id' | 'email' | 'displayName' | 'role'>;
      refreshTokenId?: string;
    }
  }
}

export {};
