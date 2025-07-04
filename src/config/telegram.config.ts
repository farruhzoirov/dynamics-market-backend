import { registerAs } from '@nestjs/config';
import * as process from 'node:process';
import { config } from 'dotenv';

config();

export const TELEGRAM = 'TELEGRAM';

export default registerAs(TELEGRAM, () => ({
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID,
  TOPIC_ID: process.env.TOPIC_ID,
}));
