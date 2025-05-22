import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'amocrm-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AmocrmService {
  private readonly logger = new Logger(AmocrmService.name);
  private tokenPath = path.join(process.cwd(), 'amocrm-token.json');

  constructor(private readonly configService: ConfigService) {}

  async authorizeWithCode(code: string) {
    try {
      //   const tokens = await this.client.token.getAccessTokenByCode(code);
      const amoConfig = this.configService.get('CONFIG_AMO_CRM');

      const client = new Client({
        domain: amoConfig.AMOCRM_DOMAIN,
        auth: {
          client_id: amoConfig.AMOCRM_CLIENT_ID,
          client_secret: amoConfig.AMOCRM_CLIENT_SECRET,
          redirect_uri: amoConfig.AMOCRM_REDIRECT_URL,
          code: code,
        },
      });

      await client.connection.connect();
      const token = client.token.getValue();
      if (!fs.existsSync(this.tokenPath)) {
        fs.openSync('./amocrm-token.json', 'w');
      }
      fs.writeFileSync(this.tokenPath, JSON.stringify(token, null, 2));
      console.log('✅ Tokens saved: amocrm-token.json');
    } catch (error) {
      this.logger.error(
        '❌ Auth_code orqali token olishda xatolik:',
        error.message,
      );
      throw error;
    }
  }
}
