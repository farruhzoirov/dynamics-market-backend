import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schema/order.model';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { Counter, CounterSchema } from './schema/counter.model';
import { OrderWithAmoCrmService } from 'src/shared/module/amocrm/services/order.service';
import { ConnectAmocrmService } from 'src/shared/module/amocrm/connect-amocrm.service';
import { TelegramNotificationService } from '../../shared/module/telegram/telegram.service';
import {
  OrderStatus,
  OrderStatusSchema,
} from '../order-status/schema/order-status.model';
import { OrderStatusService } from '../order-status/order-status.service';
import { OrderStatusModule } from '../order-status/order-status.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Cart.name,
        schema: CartSchema,
      },
      {
        name: Counter.name,
        schema: CounterSchema,
      },
    ]),
    OrderStatusModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, TelegramNotificationService],
})
export class OrderModule {}
