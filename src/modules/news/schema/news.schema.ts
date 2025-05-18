import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsDocument = News & Document;

@Schema({ timestamps: true })
export class News {
  @Prop({ required: true })
  titleUz: string;

  @Prop({ required: true })
  titleRu: string;

  @Prop({ required: true })
  titleEn: string;

  @Prop({ required: true })
  slugUz: string;

  @Prop({ required: true })
  slugRu: string;

  @Prop({ required: true })
  slugEn: string;

  @Prop({ required: true })
  shortDescUz: string;

  @Prop({ required: true })
  shortDescRu: string;

  @Prop({ required: true })
  shortDescEn: string;

  @Prop({ required: true })
  contentUz: string;

  @Prop({ required: true })
  contentRu: string;

  @Prop({ required: true })
  contentEn: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: 1 })
  status: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const NewsSchema = SchemaFactory.createForClass(News);
NewsSchema.index({ slugUz: 1 });
NewsSchema.index({ slugRu: 1 });
NewsSchema.index({ slugEn: 1 });
NewsSchema.index({ titleUz: 1, titleRu: 1, titleEn: 1 });
NewsSchema.index({ isDeleted: 1 });
NewsSchema.index({ status: 1 });
