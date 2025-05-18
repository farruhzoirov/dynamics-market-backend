import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FaqDocument = HydratedDocument<Faq>;

@Schema({ timestamps: true })
export class Faq {
  @Prop({ required: true })
  questionUz: string;

  @Prop({ required: true })
  questionRu: string;

  @Prop({ required: true })
  questionEn: string;

  @Prop({ required: true })
  answerUz: string;

  @Prop({ required: true })
  answerRu: string;

  @Prop({ required: true })
  answerEn: string;

  @Prop({ default: 1 })
  status: number;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ required: true })
  index: number;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
