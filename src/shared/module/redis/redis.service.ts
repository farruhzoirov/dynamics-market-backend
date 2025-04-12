import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis {
  constructor(private readonly configService: ConfigService) {
    super({
      host: configService.get('REDIS').REDIS_HOST ?? 'redis',
      port: configService.get('REDIS').REDIS_PORT ?? '6379',
      readOnly: false,
    });
    super.on('error', (error) => {
      console.log('Error Connecting to Redis');
      process.exit(1);
    });

    super.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  async setData(key: string, value: any) {
    const stringifiedData = JSON.stringify(value);
    await super.set(key, stringifiedData, 'EX', 300);
  }

  async getData(key: string) {
    const getDataByKey = await super.get(key);
    console.log('GetDataByKey', getDataByKey);
    if (!getDataByKey) return null;
    return JSON.parse(getDataByKey);
  }
}
