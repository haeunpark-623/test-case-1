import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('prisma/client singleton', () => {
  let savedNodeEnv: string | undefined;

  beforeEach(() => {
    savedNodeEnv = process.env.NODE_ENV;
    // 매 테스트마다 module cache 초기화로 globalThis 캐시 효과 검증
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
});
