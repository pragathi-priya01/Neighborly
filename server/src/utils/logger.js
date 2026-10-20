import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.isDev ? 'debug' : 'info',
  transport: env.isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  redact: ['password', 'passwordHash', 'token', 'secret', 'authorization', 'cookie', 'razorpay_signature']
});
