import { registerAs } from '@nestjs/config';
import * as process from 'node:process';
import { config } from 'dotenv';

config();

export const REDIS = 'REDIS';

export default registerAs(REDIS, () => ({
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
}));
