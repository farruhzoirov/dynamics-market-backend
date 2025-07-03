import { Module } from '@nestjs/common';
import { TelegramNotificationService } from './telegram.service';

@Module({
  providers: [TelegramNotificationService],
})
export class TelegramModule {}
