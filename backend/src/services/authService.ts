import type { PrismaClient } from '@prisma/client';

import { ApiError, ERROR_CODES } from '../lib/errors.js';
import { signToken } from '../lib/jwt.js';
import { hashPassword } from '../lib/passwords.js';

export interface SignupInput {
  email: string;
  username: string;
  password: string;
}

export interface UserResponse {
  email: string;
  username: string;
  bio: string;
  image: string;
  token: string;
}

const USERNAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validate(input: SignupInput): void {
  const errors: Record<string, string[]> = {};
  if (!input.email || !EMAIL_PATTERN.test(input.email)) {
    errors.email = ['is invalid'];
  }
  if (!input.username || !USERNAME_PATTERN.test(input.username)) {
    errors.username = ['is invalid'];
  }
  if (!input.password || input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = ['is too short'];
  }
  if (Object.keys(errors).length > 0) {
    const code =
      errors.password !== undefined
        ? ERROR_CODES.AUTH_SIGNUP_WEAK_PASSWORD
        : errors.email !== undefined
          ? ERROR_CODES.AUTH_SIGNUP_INVALID_EMAIL
          : ERROR_CODES.AUTH_SIGNUP_INVALID_USERNAME;
    throw new ApiError(code, 422, errors);
  }
}

export async function signup(prisma: PrismaClient, input: SignupInput): Promise<UserResponse> {
  validate(input);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    if (existing.email === input.email) {
      throw new ApiError(ERROR_CODES.AUTH_SIGNUP_DUPLICATE_EMAIL, 422, {
        email: ['has already been taken'],
      });
    }
    throw new ApiError(ERROR_CODES.AUTH_SIGNUP_DUPLICATE_USERNAME, 422, {
      username: ['has already been taken'],
    });
  }

  const password_hash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      password_hash,
    },
    select: { id: true, email: true, username: true, bio: true, image: true },
  });

  const token = signToken({ sub: user.id, username: user.username });
  return {
    email: user.email,
    username: user.username,
    bio: user.bio,
    image: user.image,
    token,
  };
}
