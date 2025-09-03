import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  public bot: TelegramBot;
  private readonly logger = new Logger(ContactService.name);
  private readonly adminChatId: string;

  constructor(private readonly configService: ConfigService) {
    const botToken = this.configService.get('TELEGRAM').TELEGRAM_BOT_TOKEN;
    this.adminChatId = this.configService.get('TELEGRAM').ADMIN_USER_ID;

    if (!botToken) {
      this.logger.error('TELEGRAM_BOT_TOKEN is not set');
      return;
    }

    if (!this.adminChatId) {
      this.logger.error('ADMIN_CHAT_ID is not set');
      return;
    }

    this.bot = new TelegramBot(botToken, { polling: false });
  }

  async postContact(body: ContactDto) {
    try {
      const messageText = `🔔 Yangi xabar! \n\n👤 Ism: ${body.name}\n📱 Telegram/Telefon: ${
        body.tgOrPhone || "Ko'rsatilmagan"
      }\n📧 Elektron pochta: ${body.email || "Ko'rsatilmagan"}\n\n💬 Xabar: ${
        body.message || "Ko'rsatilmagan"
      }`;

      await this.bot.sendMessage(this.adminChatId, messageText);
    } catch (err) {
      throw err;
    }
  }
}
