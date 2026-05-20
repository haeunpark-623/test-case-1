/**
 * RealWorld error envelope: `{errors: {field: [message]}}`.
 * Internal error code uses PREFIX_REASON convention (11-coding §2).
 */
export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields: FieldErrors;

  constructor(code: string, status: number, fields: FieldErrors = {}) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }

  toResponseBody(): { errors: FieldErrors } {
    return { errors: this.fields };
  }
}

export const ERROR_CODES = {
  AUTH_SIGNUP_DUPLICATE_EMAIL: 'AUTH_SIGNUP_DUPLICATE_EMAIL',
  AUTH_SIGNUP_DUPLICATE_USERNAME: 'AUTH_SIGNUP_DUPLICATE_USERNAME',
  AUTH_SIGNUP_WEAK_PASSWORD: 'AUTH_SIGNUP_WEAK_PASSWORD',
  AUTH_SIGNUP_INVALID_EMAIL: 'AUTH_SIGNUP_INVALID_EMAIL',
  AUTH_SIGNUP_INVALID_USERNAME: 'AUTH_SIGNUP_INVALID_USERNAME',
} as const;
