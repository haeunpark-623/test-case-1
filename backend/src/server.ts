import { buildApp } from './app.js';

const port = Number(process.env.PORT ?? 4000);
const host = '0.0.0.0';
const profile = process.env.NODE_ENV ?? 'unknown';

buildApp()
  .then((app) => app.listen({ port, host }).then((address) => ({ app, address })))
  .then(({ app, address }) => {
    app.log.info(`[fastify] listening on ${address} profile=${profile}`);
  })
  .catch((err) => {
    console.error('[server] startup failed', err);
    process.exit(1);
  });
