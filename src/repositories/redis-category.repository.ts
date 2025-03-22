import { Injectable } from '@nestjs/common';
import { RedisService } from '../shared/services/redis.service';

@Injectable()
export class RedisCategoryRepository {
  constructor(private readonly redis: RedisService) {}

  async get(key: string) {
    const categories = await this.redis.get(key);
    if (!categories) return null;

    return JSON.parse(categories);
  }

  async set(key: string, value: any, exp?: number) {
    const stringValue = JSON.stringify(value);
    await this.redis.set(key, stringValue, 'EX', exp);
  }
}
