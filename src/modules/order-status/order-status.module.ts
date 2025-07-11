import { Module } from '@nestjs/common';
import { OrderStatusController } from './order-status.controller';
import { OrderStatusService } from './order-status.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../order/schema/order.model';
import { OrderStatus, OrderStatusSchema } from './schema/order-status.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderStatus.name, schema: OrderStatusSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [OrderStatusController],
  providers: [OrderStatusService],
  exports: [OrderStatusService],
})
export class OrderStatusModule {}
