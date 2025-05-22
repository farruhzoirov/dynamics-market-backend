import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'amocrm-js';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConnectAmocrmService implements OnModuleInit, OnModuleDestroy {
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
        this.logger.log('📦 Token fayldan yuklandi');
      } catch (err) {
        this.logger.warn('⚠️ Token faylni o‘qishda xatolik:', err.message);
      }
    }

    this.client.token.on('change', () => {
      const tokens = this.client.token.getValue();
      fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2), 'utf8');
      this.logger.log('✅ Amocrm token yangilandi va saqlandi');

      this.scheduleTokenRefresh(tokens.expires_in);
    });
  }

  private scheduleTokenRefresh(expiresIn: number) {
    if (this.renewTimeout) {
      clearTimeout(this.renewTimeout);
    }

    const refreshTime = Math.max(expiresIn - 120, 30) * 1000; // 2 daqiqa oldin yangilash
    this.renewTimeout = setTimeout(() => this.updateConnection(), refreshTime);
    this.logger.log(
      `🕐 Token ${refreshTime / 1000}s dan keyin avtomatik yangilanadi`,
    );
  }

  async updateConnection() {
    try {
      if (this.client.connection.isTokenExpired()) {
        this.logger.warn('⏳ Token eskirgan. Yangilanmoqda...');
        await this.client.connection.update(); // refresh_token ishlatiladi
        this.logger.log('🔄 Token muvaffaqiyatli yangilandi');
      } else {
        this.logger.log('✅ Token hali yaroqli, yangilash shart emas');
      }
    } catch (error) {
      this.logger.error(
        '❌ Token yangilashda xatolik:',
        error.response?.data || error.message,
      );
    }
  }

  async onModuleInit() {
    try {
      const tokens = this.client.token.getValue();
      if (!tokens || this.client.connection.isTokenExpired()) {
        this.logger.warn(
          '⏳ Token eskirgan yoki mavjud emas. Yangilanmoqda...',
        );

        if (tokens?.refresh_token) {
          await this.client.connection.update();
          this.logger.log('🔄 Token muvaffaqiyatli yangilandi');
        } else {
          this.logger.warn(
            '⚠️ refresh_token topilmadi. Iltimos, qayta autentifikatsiya qiling.',
          );
          return;
        }
      }

      const expiresIn =
        Math.max(this.client.token.getValue().expires_in - 120, 30) * 1000;
      if (this.renewTimeout) clearTimeout(this.renewTimeout);

      this.renewTimeout = setTimeout(() => this.updateConnection(), expiresIn);

      this.logger.log('✅ AmoCRM ulanishi muvaffaqiyatli');
    } catch (error) {
      this.logger.error(
        '❌ AmoCRM ulanishi muammosi:',
        error.response?.data || error.message,
      );
    }
  }

  // 5️⃣ Timer tozalash
  onModuleDestroy() {
    if (this.renewTimeout) {
      clearTimeout(this.renewTimeout);
      this.logger.log('🛑 Amocrm auto-update taymeri tozalandi');
    }
  }

  getClient(): Client {
    return this.client;
  }
}
