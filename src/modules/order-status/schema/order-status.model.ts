import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OrderStatusDocument = OrderStatus & Document;

@Schema({ timestamps: true })
export class OrderStatus {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  index: number;
}

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);
OrderStatusSchema.index({ name: 1 }, { unique: true });
