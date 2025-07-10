import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OrderStatusDocument = OrderStatus & Document;

@Schema({ timestamps: true })
export class OrderStatus {
  @Prop({ required: true, unique: true })
  nameUz: string;

  @Prop({ required: true, unique: true })
  nameRu: string;

  @Prop({ required: true, unique: true })
  nameEn: string;

  @Prop({ required: true })
  color: string;

  @Prop({ default: false })
  static: boolean;

  @Prop({ required: true })
  index: number;
}

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);
OrderStatusSchema.index({ nameUz: 1, nameRu: 1, nameEn: 1 }, { unique: true });
