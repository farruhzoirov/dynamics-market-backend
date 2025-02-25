import { registerAs } from '@nestjs/config';
import * as process from 'node:process';
import { config } from 'dotenv';
config();

export const CONFIG_JWT = 'CONFIG_JWT';

export default registerAs(CONFIG_JWT, () => ({
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
}));
