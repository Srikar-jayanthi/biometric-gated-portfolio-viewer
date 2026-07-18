import { inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';

export interface UserSession {
  userId: string;
  email: string;
}

export async function createContext({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) {
  let session: UserSession | null = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && typeof decoded === 'object' && decoded.userId) {
        session = {
          userId: decoded.userId,
          email: decoded.email,
        };
      }
    } catch (err) {
      // Token verification failed
    }
  }

  return {
    prisma,
    session,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
