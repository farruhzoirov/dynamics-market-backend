import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;
@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: mongoose.Types.ObjectId, default: null, required: true })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, default: null, required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 1 })
  quantity: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.index({ productId: 1 });
CartSchema.index({ userId: 1 });
