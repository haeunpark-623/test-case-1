import type { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../lib/errors';
import { signup } from '../services/authService';

interface SeedUser {
  id: number;
  email: string;
  username: string;
  bio: string;
  image: string;
}

function makeMockPrisma(seed: SeedUser[] = []): PrismaClient {
  const users = [...seed];
  let nextId = users.length + 1;
  return {
    user: {
      findFirst: vi.fn(async ({ where }: { where: { OR: Array<{ email?: string; username?: string }> } }) => {
        const matchEmail = where.OR.find((c) => c.email)?.email;
        const matchUsername = where.OR.find((c) => c.username)?.username;
        return (
          users.find(
            (u) => (matchEmail && u.email === matchEmail) || (matchUsername && u.username === matchUsername),
          ) ?? null
        );
      }),
      create: vi.fn(async ({ data }: { data: { email: string; username: string; password_hash: string } }) => {
        const user: SeedUser = {
          id: nextId++,
          email: data.email,
          username: data.username,
          bio: '',
          image: '',
        };
        users.push(user);
        return user;
      }),
    },
  } as unknown as PrismaClient;
}

describe('authService.signup', () => {
  let savedSecret: string | undefined;

  beforeEach(() => {
    savedSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret-min-32-chars-aaaaaaaaaaaaaa';
    process.env.JWT_EXP_SECONDS = '604800';
  });

  afterEach(() => {
    if (savedSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = savedSecret;
    }
  });

  it('returns RealWorld user response on happy path', async () => {
    const prisma = makeMockPrisma();
    const res = await signup(prisma, {
      email: 'jane@example.com',
      username: 'jane',
      password: 'test1234',
    });
    expect(res.email).toBe('jane@example.com');
    expect(res.username).toBe('jane');
    expect(res.bio).toBe('');
    expect(res.image).toBe('');
    expect(res.token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it('rejects duplicate email with 422', async () => {
    const prisma = makeMockPrisma([{ id: 1, email: 'jane@example.com', username: 'jane', bio: '', image: '' }]);
    try {
      await signup(prisma, { email: 'jane@example.com', username: 'other', password: 'test1234' });
      throw new Error('expected ApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(422);
      expect(apiErr.fields.email).toEqual(['has already been taken']);
    }
  });

  it('rejects duplicate username with 422', async () => {
    const prisma = makeMockPrisma([{ id: 1, email: 'jane@example.com', username: 'jane', bio: '', image: '' }]);
    try {
      await signup(prisma, { email: 'other@example.com', username: 'jane', password: 'test1234' });
      throw new Error('expected ApiError');
    } catch (err) {
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(422);
      expect(apiErr.fields.username).toEqual(['has already been taken']);
    }
  });

  it('rejects passwords shorter than 8 chars with 422', async () => {
    const prisma = makeMockPrisma();
    try {
      await signup(prisma, { email: 'a@b.com', username: 'a', password: 'abc' });
      throw new Error('expected ApiError');
    } catch (err) {
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(422);
      expect(apiErr.fields.password).toEqual(['is too short']);
    }
  });

  it('rejects malformed email with 422', async () => {
    const prisma = makeMockPrisma();
    try {
      await signup(prisma, { email: 'not-an-email', username: 'jane', password: 'test1234' });
      throw new Error('expected ApiError');
    } catch (err) {
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(422);
      expect(apiErr.fields.email).toEqual(['is invalid']);
    }
  });
});
