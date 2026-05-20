import { buildApp } from './app.js';

const port = Number(process.env.PORT ?? 4000);
const host = '0.0.0.0';
const profile = process.env.NODE_ENV ?? 'unknown';

const app = buildApp();

app
  .listen({ port, host })
  .then((address) => {
    app.log.info(`[fastify] listening on ${address} profile=${profile}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
