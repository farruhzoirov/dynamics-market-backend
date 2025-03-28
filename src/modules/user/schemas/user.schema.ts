import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../../shared/enums/roles.enum';
import { Gender } from '../enums/gender.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  image: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.user,
  })
  role: UserRole;

  @Prop({ type: [{ long: Number, lat: Number }], default: [] })
  locations: [];

  @Prop({ default: null })
  telegram: string;

  @Prop({
    type: String,
    default: null,
    enum: Gender,
  })
  gender: Gender;

  @Prop({ default: null })
  regionId: string;

  @Prop({ default: null })
  districtId: string;

  @Prop({ default: null })
  address: string;

  @Prop({ default: null })
  phone: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
