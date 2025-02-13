import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";

export type MidCategoryDocument = HydratedDocument<MidCategory>;

@Schema({timestamps: true})
export class MidCategory {
  @Prop()
  nameUz: string;

  @Prop()
  nameRu: string;

  @Prop()
  nameEn: string;

  @Prop()
  slugUz: string;

  @Prop()
  slugRu: string;

  @Prop()
  slugEn: string;

  @Prop({type: Types.ObjectId, ref: 'MainCategory' })
  mainCategory: Types.ObjectId;
}


export const MidCategorySchema = SchemaFactory.createForClass(MidCategory);