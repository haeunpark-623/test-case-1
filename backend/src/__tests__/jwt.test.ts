import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { signToken, verifyToken } from '../lib/jwt';

describe('jwt lib', () => {
  let savedSecret: string | undefined;
  let savedExp: string | undefined;

  beforeEach(() => {
    savedSecret = process.env.JWT_SECRET;
    savedExp = process.env.JWT_EXP_SECONDS;
    process.env.JWT_SECRET = 'test-secret-min-32-chars-aaaaaaaaaaaaaa';
    process.env.JWT_EXP_SECONDS = '604800';
  });

  afterEach(() => {
    if (savedSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = savedSecret;
    }
    if (savedExp === undefined) {
      delete process.env.JWT_EXP_SECONDS;
    } else {
      process.env.JWT_EXP_SECONDS = savedExp;
    }
  });

  it('sign + verify cycle preserves payload', () => {
    const token = signToken({ sub: 42, username: 'jane' });
    const decoded = verifyToken(token);
    expect(decoded.sub).toBe(42);
    expect(decoded.username).toBe('jane');
    expect(decoded.exp - decoded.iat).toBe(604800);
  });

  it('throws when JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;
    expect(() => signToken({ sub: 1, username: 'a' })).toThrow(/AUTH_JWT_SECRET_MISSING/);
  });

  it('throws when JWT_SECRET is shorter than 32 chars', () => {
    process.env.JWT_SECRET = 'short';
    expect(() => signToken({ sub: 1, username: 'a' })).toThrow(/AUTH_JWT_SECRET_WEAK/);
  });

  it('verify rejects tampered token', () => {
    const token = signToken({ sub: 1, username: 'a' });
    const tampered = token.slice(0, -4) + 'XXXX';
    expect(() => verifyToken(tampered)).toThrow();
  });
});
