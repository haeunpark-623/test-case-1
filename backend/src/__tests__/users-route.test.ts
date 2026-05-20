import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

let mockSignup: ReturnType<typeof vi.fn>;

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

vi.mock('../services/authService', () => ({
  signup: (...args: unknown[]) => mockSignup(...args),
}));

describe('POST /api/users', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-min-32-chars-aaaaaaaaaaaaaa';
    const { buildApp } = await import('../app');
    app = await buildApp({ logLevel: 'silent' });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockSignup = vi.fn();
  });

  it('returns 201 with user envelope on happy path', async () => {
    mockSignup.mockResolvedValueOnce({
      email: 'jane@example.com',
      username: 'jane',
      bio: '',
      image: '',
      token: 'token.value.here',
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { user: { email: 'jane@example.com', username: 'jane', password: 'test1234' } },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({
      user: {
        email: 'jane@example.com',
        username: 'jane',
        bio: '',
        image: '',
        token: 'token.value.here',
      },
    });
  });

  it('returns 422 with RealWorld error envelope when ApiError thrown', async () => {
    const { ApiError } = await import('../lib/errors');
    mockSignup.mockRejectedValueOnce(
      new ApiError('AUTH_SIGNUP_DUPLICATE_EMAIL', 422, { email: ['has already been taken'] }),
    );
    const res = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { user: { email: 'dup@example.com', username: 'dup', password: 'test1234' } },
    });
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({ errors: { email: ['has already been taken'] } });
  });

  it('returns 422 when body has no "user" object', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: {},
    });
    expect(res.statusCode).toBe(422);
    expect(res.json().errors.body).toEqual(['must contain a "user" object']);
  });
});
