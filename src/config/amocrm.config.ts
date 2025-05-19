import { registerAs } from '@nestjs/config';
import * as process from 'node:process';
import { config } from 'dotenv';

config();

export const CONFIG_AMO_CRM = 'CONFIG_AMO_CRM';

export default registerAs(CONFIG_AMO_CRM, () => ({
  AMOCRM_DOMAIN: process.env.AMOCRM_DOMAIN,
  AMOCRM_CLIENT_ID: process.env.AMOCRM_CLIENT_ID,
  AMORM_CLIENT_SECRET: process.env.AMOCRM_CLIENT_SECRET,
  AMOCRM_REDIRECT_URL: process.env.AMOCRM_REDIRECT_URL,
}));
