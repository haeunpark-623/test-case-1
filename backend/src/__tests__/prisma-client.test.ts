import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// @prisma/client mock — 실 PrismaClient는 prisma generate 후에만 동작.
// 본 단위 테스트는 client.ts의 globalThis 캐시 로직만 검증 — engine 호출 0.
vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    options: unknown;
    constructor(options?: unknown) {
      this.options = options;
    }
    async $connect(): Promise<void> {
      /* noop */
    }
    async $disconnect(): Promise<void> {
      /* noop */
    }
  }
  return { PrismaClient: MockPrismaClient };
});

describe('prisma/client singleton', () => {
  let savedNodeEnv: string | undefined;

  beforeEach(() => {
    savedNodeEnv = process.env.NODE_ENV;
    vi.resetModules();
    delete (globalThis as { __conduit_prisma__?: unknown }).__conduit_prisma__;
  });

  afterEach(() => {
    if (savedNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = savedNodeEnv;
    }
    delete (globalThis as { __conduit_prisma__?: unknown }).__conduit_prisma__;
  });

  it('exports a PrismaClient instance', async () => {
    const { prisma } = await import('../prisma/client');
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
  });

  it('caches the instance on globalThis in non-production env', async () => {
    process.env.NODE_ENV = 'development';
    const { prisma: first } = await import('../prisma/client');
    expect((globalThis as { __conduit_prisma__?: unknown }).__conduit_prisma__).toBe(first);

    vi.resetModules();
    const { prisma: second } = await import('../prisma/client');
    expect(second).toBe(first);
  });

  it('does NOT cache on globalThis when NODE_ENV=production', async () => {
    process.env.NODE_ENV = 'production';
    delete (globalThis as { __conduit_prisma__?: unknown }).__conduit_prisma__;
    await import('../prisma/client');
    expect((globalThis as { __conduit_prisma__?: unknown }).__conduit_prisma__).toBeUndefined();
  });

  it('respects LOG_LEVEL=debug for verbose logging', async () => {
    process.env.LOG_LEVEL = 'debug';
    const { prisma } = await import('../prisma/client');
    const options = (prisma as unknown as { options: { log: string[] } }).options;
    expect(options.log).toEqual(['query', 'error', 'warn']);
    delete process.env.LOG_LEVEL;
  });

  it('uses minimal logging when LOG_LEVEL is not debug', async () => {
    delete process.env.LOG_LEVEL;
    const { prisma } = await import('../prisma/client');
    const options = (prisma as unknown as { options: { log: string[] } }).options;
    expect(options.log).toEqual(['error']);
  });
});
