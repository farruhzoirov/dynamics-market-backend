import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { CreateOrderDto } from '../../../modules/order/dto/order.dto';
import { ProductItem } from '../../interfaces/product-items';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramNotificationService {
  public bot: TelegramBot;
  private readonly logger = new Logger(TelegramNotificationService.name);
  private readonly adminChatId: string;

  constructor(private readonly configService: ConfigService) {
    const botToken = this.configService.get('TELEGRAM').TELEGRAM_BOT_TOKEN;
    this.adminChatId = this.configService.get('TELEGRAM').ADMIN_CHAT_ID;

    if (!botToken) {
      this.logger.error('TELEGRAM_BOT_TOKEN is not set');
      return;
    }

    if (!this.adminChatId) {
      this.logger.error('ADMIN_CHAT_ID  is not set');
      return;
    }

    this.bot = new TelegramBot(botToken, { polling: false });
  }

  async sendOrderNotification(
    body: CreateOrderDto,
    items: ProductItem[],
    orderCode: string,
  ) {
    try {
      if (!this.bot || !this.adminChatId) {
        this.logger.warn('Telegram bot or admin chat id not configured');
        return;
      }

      const message = this.formatOrderMessage(orderCode, body, items);
      await this.bot.sendMessage(this.adminChatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });

      this.logger.log(`Telegram notification sent for order: ${orderCode}`);
    } catch (err) {
      this.logger.error('Failed to send Telegram notification', err);
    }
  }

  private formatOrderMessage(
    orderCode: string,
    body: CreateOrderDto,
    items: ProductItem[],
  ): string {
    const customerInfo = `🆔 <b>Номер заказа:</b> ${orderCode}
👤 <b>Клиент:</b> ${body.firstName} ${body.lastName}
📧 <b>Электронная почта:</b> ${body.email}
📱 <b>Телефон:</b> ${body.phone}
🏢 <b>Тип клиента:</b> ${body.customerType}${body.companyName ? `\n🏪 <b>Компания:</b> ${body.companyName}` : ''}${body.comment ? `\n💬 <b>Комментарий:</b> ${body.comment}` : ''}`;

    const itemsInfo = items
      .map((item, index) => {
        return `${index + 1}. <b>${item.nameRu}</b>
📦 <b>СКУ:</b> ${item.sku}
🔢 <b>Количество:</b> ${item.quantity}
💰 <b>Цена:</b> ${item.price ? `${item.price.toLocaleString()} сум` : 'Не указана'}`;
      })
      .join('\n\n');

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
      return sum + (item.price ? item.price * item.quantity : 0);
    }, 0);

    return `<b>НОВЫЙ ЗАКАЗ</b>

${customerInfo}

📋 <b>ДЕТАЛИ ЗАКАЗА:</b>
${itemsInfo}

📊 <b>ИТОГО:</b>
🔢 <b>Всего товаров:</b> ${totalItems}
💰 <b>Общая сумма:</b> ${totalPrice > 0 ? `${totalPrice.toLocaleString()}$` : 'Не указана'}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU', {
      timeZone: 'Asia/Tashkent',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`;
  }
}
