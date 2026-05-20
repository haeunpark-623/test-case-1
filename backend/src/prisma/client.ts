import { PrismaClient } from '@prisma/client';

// Node hot reload(tsx watch) 시 다중 PrismaClient 인스턴스 방지.
// globalThis에 캐시해 같은 프로세스에서 단일 인스턴스 보장.
declare global {
  // eslint-disable-next-line no-var
  var __conduit_prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__conduit_prisma__ ??
  new PrismaClient({
    log: process.env.LOG_LEVEL === 'debug' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__conduit_prisma__ = prisma;
}
