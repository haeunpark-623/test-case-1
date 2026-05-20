import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../app';

describe('GET /health', () => {
  const app = buildApp({ logLevel: 'silent' });

  beforeAll(async () => {
    await app.ready();
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
