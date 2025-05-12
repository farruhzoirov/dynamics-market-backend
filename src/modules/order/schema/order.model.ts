import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CustomerType } from '../../../shared/enums/customer-type.enum';
import { OrderStatus } from '../../../shared/enums/order-status.enum';
import { ProductItem } from 'src/shared/interfaces/product-items';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, default: null })
  firstName: string;

  @Prop({ required: true, default: null })
  lastName: string;

  @Prop({ required: true, default: null })
  email: string;

  @Prop({ required: true })
  userId: string;

  @Prop([
    {
      productId: { type: String, required: true },
      nameUz: { type: String, required: true },
      nameRu: { type: String, required: true },
      nameEn: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, default: null },
    },
  ])
  items: ProductItem[];

  @Prop({ required: true })
  orderCode: string;

  @Prop({ default: '' })
  comment: string;

  @Prop({
    type: String,
    enum: CustomerType,
    required: true,
  })
  customerType: CustomerType;

  @Prop({ default: null })
  companyName: string;

  @Prop({ default: null, required: true })
  phone: string;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.new,
  })
  status: OrderStatus;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderCode: 1 });
OrderSchema.index({ isDeleted: 1 });
