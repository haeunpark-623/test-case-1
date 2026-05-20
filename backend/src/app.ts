import Fastify, { type FastifyInstance } from 'fastify';

import { usersRoutes } from './routes/users.js';

export interface AppOptions {
  logLevel?: string;
}

export async function buildApp(opts: AppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: opts.logLevel ?? process.env.LOG_LEVEL ?? 'info',
    },
  });

  app.get('/health', async () => ({
    status: 'ok',
    profile: process.env.NODE_ENV ?? 'unknown',
    timestamp: new Date().toISOString(),
  }));

  await app.register(usersRoutes);

  return app;
}
