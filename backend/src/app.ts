import Fastify, { type FastifyInstance } from 'fastify';

export interface AppOptions {
  logLevel?: string;
}

export function buildApp(opts: AppOptions = {}): FastifyInstance {
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

  return app;
}
