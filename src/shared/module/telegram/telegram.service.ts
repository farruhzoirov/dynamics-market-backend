import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { CreateOrderDto } from '../../../modules/order/dto/order.dto';
import { ProductItem } from '../../interfaces/product-items';
import { ConfigService } from '@nestjs/config';
import { TELEGRAM } from '../../../config/telegram.config';

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
    const customerInfo = `
      🆔 <b>Order Code:</b> ${orderCode}
      👤 <b>Customer:</b> ${body.firstName} ${body.lastName}
      📧 <b>Email:</b> ${body.email}
      📱 <b>Phone:</b> ${body.phone}
      🏢 <b>Customer Type:</b> ${body.customerType}
      ${body.companyName ? `🏪 <b>Company:</b> ${body.companyName}` : ''}
      ${body.comment ? `💬 <b>Comment:</b> ${body.comment}` : ''}
      `;

    const itemsInfo = items
      .map((item, index) => {
        return `
      ${index + 1}. <b>${item.nameUz}</b>
         📦 SKU: ${item.sku}
         🔢 Quantity: ${item.quantity}
         💰 Price: ${item.price ? `${item.price} so'm` : 'N/A'}
  `;
      })
      .join('');

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
      return sum + (item.price ? item.price * item.quantity : 0);
    }, 0);

    return `
      🛍️ <b>YANGI BUYURTMA</b>
      
      ${customerInfo}
      
      📋 <b>BUYURTMA TAFSILOTLARI:</b>
      ${itemsInfo}
      
      📊 <b>JAMI:</b>
      🔢 Total Items: ${totalItems}
      💰 Total Price: ${totalPrice > 0 ? `${totalPrice} so'm` : 'N/A'}
      
      ⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}
      `;
  }
}
