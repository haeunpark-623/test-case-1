import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    async $connect(): Promise<void> {
      /* noop */
    }
    async $disconnect(): Promise<void> {
      /* noop */
    }
  }
  return { PrismaClient: MockPrismaClient };
});

describe('GET /health', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const { buildApp } = await import('../app');
    app = await buildApp({ logLevel: 'silent' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with status ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.profile).toBeDefined();
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('buildApp', () => {
  let savedLogLevel: string | undefined;
  let savedNodeEnv: string | undefined;

  beforeEach(() => {
    savedLogLevel = process.env.LOG_LEVEL;
    savedNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (savedLogLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = savedLogLevel;
    }
    if (savedNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = savedNodeEnv;
    }
  });

  it('uses opts.logLevel when provided', async () => {
    const { buildApp } = await import('../app');
    const app = await buildApp({ logLevel: 'silent' });
    expect(app.log.level).toBe('silent');
    await app.close();
  });

  it('falls back to process.env.LOG_LEVEL when opts.logLevel missing', async () => {
    process.env.LOG_LEVEL = 'warn';
    const { buildApp } = await import('../app');
    const app = await buildApp();
    expect(app.log.level).toBe('warn');
    await app.close();
  });

  it('falls back to "info" when both opts and env are missing', async () => {
    delete process.env.LOG_LEVEL;
    const { buildApp } = await import('../app');
    const app = await buildApp();
    expect(app.log.level).toBe('info');
    await app.close();
  });

  it('reports "unknown" profile when NODE_ENV missing', async () => {
    delete process.env.NODE_ENV;
    const { buildApp } = await import('../app');
    const app = await buildApp({ logLevel: 'silent' });
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.json().profile).toBe('unknown');
    await app.close();
  });
});
