import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: number;
  username: string;
}

interface DecodedPayload extends JwtPayload {
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('AUTH_JWT_SECRET_MISSING: JWT_SECRET environment variable is not set');
  }
  if (secret.length < 32) {
    throw new Error('AUTH_JWT_SECRET_WEAK: JWT_SECRET must be at least 32 characters (HS256)');
  }
  return secret;
}

function getExpiresInSeconds(): number {
  const raw = process.env.JWT_EXP_SECONDS;
  const parsed = raw ? Number(raw) : 604800;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 604800;
  }
  return parsed;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), {
    algorithm: 'HS256',
    expiresIn: getExpiresInSeconds(),
  });
}

export function verifyToken(token: string): DecodedPayload {
  const decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
  if (typeof decoded === 'string') {
    throw new Error('AUTH_JWT_INVALID_PAYLOAD: token payload is a string, expected object');
  }
  return decoded as DecodedPayload;
}
