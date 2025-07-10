import { registerAs } from '@nestjs/config';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as process from 'node:process';
import { config } from 'dotenv';

config();

export const CACHE_CONFIG = 'cache';

export default registerAs(CACHE_CONFIG, (): CacheModuleOptions => ({
  store: 'redis',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  ttl: 300, // 5 minutes default TTL
  max: 1000, // maximum number of items in cache
  db: 0, // Redis database index
  password: process.env.REDIS_PASSWORD,
  keyPrefix: 'dynamics_market:',
  retryAttempts: 3,
  retryDelay: 1000,
  // Connection pool settings
  maxRetriesPerRequest: 3,
  connectTimeout: 60000,
  lazyConnect: true,
}));