import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis {
  constructor() {
    super({
      host: 'redis',
      port: 6379,
    });
    super.on('error', (error) => {
      console.log('Error Connecting to Redis');
      process.exit(1);
    });

    super.on('connect', () => {
      console.log('Connected to Redis');
    });
  }
}
