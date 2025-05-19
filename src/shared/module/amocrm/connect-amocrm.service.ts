import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'amocrm-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConnectAmocrmService implements OnModuleInit {
  private readonly logger = new Logger(ConnectAmocrmService.name);
  private client: Client;
  private tokenPath = path.join(process.cwd(), 'amocrm-token.json');
  private renewTimeout: NodeJS.Timeout | null = null;
  constructor(private readonly configService: ConfigService) {
    const amoConfig = this.configService.get('CONFIG_AMO_CRM');
    const auth = {
      domain: amoConfig.AMOCRM_DOMAIN,
      auth: {
        client_id: amoConfig.AMOCRM_CLIENT_ID,
        client_secret: amoConfig.AMOCRM_CLIENT_SECRET,
        redirect_uri: amoConfig.AMOCRM_REDIRECT_URL,
      },
    };
    this.client = new Client(auth);

    if (fs.existsSync(this.tokenPath)) {
      try {
        const tokens = JSON.parse(fs.readFileSync(this.tokenPath, 'utf8'));
        this.client.token.setValue(tokens);
      } catch (err) {
        this.logger.warn('⚠️ Error reading amocrm token file', err.message);
      }
    }

    this.client.token.on('change', () => {
      const tokens = this.client.token.getValue();
      fs.writeFileSync(this.tokenPath, JSON.stringify(tokens), 'utf8');
      this.logger.log('✅ Amocrm token updated');

      if (this.renewTimeout) {
        clearTimeout(this.renewTimeout);
      }
      const expiresIn = tokens.expires_in * 1000;
      this.renewTimeout = setTimeout(() => this.updateConnection(), expiresIn);
    });
  }

  async updateConnection() {
    try {
      if (this.client.connection.isTokenExpired()) {
        await this.client.connection.update();
        this.logger.log('🔄 Token avtomatik ravishda yangilandi');
      }
    } catch (error) {
      this.logger.error('❌ Error updating amocrm token:', error.message);
    }
  }

  async onModuleInit() {
    try {
      const info = await this.client.connection.connect();
      this.logger.log('✅ AmoCRM connected on app start:', info);
    } catch (error) {
      this.logger.error(
        '❌ AmoCRM connection failed:',
        error.response?.data || error.message,
      );
    }
  }

  onModuleDestroy() {
    if (this.renewTimeout) {
      clearTimeout(this.renewTimeout);
      this.logger.log('🛑 Amocrm Token updating timer cleared');
    }
  }

  getClient(): Client {
    return this.client;
  }
}
