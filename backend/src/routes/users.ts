import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';

import { ApiError } from '../lib/errors.js';
import { prisma } from '../prisma/client.js';
import { signup, type SignupInput } from '../services/authService.js';

interface SignupRequestBody {
  user?: Partial<SignupInput>;
}

export const usersRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post('/api/users', async (req: FastifyRequest<{ Body: SignupRequestBody }>, reply) => {
    const userInput = req.body?.user;
    if (!userInput || typeof userInput !== 'object') {
      return reply.code(422).send({ errors: { body: ['must contain a "user" object'] } });
    }
    try {
      const user = await signup(prisma, {
        email: userInput.email ?? '',
        username: userInput.username ?? '',
        password: userInput.password ?? '',
      });
      return reply.code(201).send({ user });
    } catch (err) {
      if (err instanceof ApiError) {
        return reply.code(err.status).send(err.toResponseBody());
      }
      req.log.error({ err }, 'signup unexpected error');
      return reply.code(500).send({ errors: { internal: ['unexpected error'] } });
    }
  });
};
