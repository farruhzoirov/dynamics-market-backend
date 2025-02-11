import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {UserRole} from "../enums/roles.enum";
import {Gender} from "../enums/gender.enum";

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps: true})
export class User {
  @Prop({required: true})
  firstName: string;

  @Prop({required: true})
  email: string;

  @Prop({required: true})
  lastName: string;

  @Prop({required:true})
  image: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.user,
    required: true
  })
  role: UserRole;

  @Prop()
  location: []

  @Prop()
  telegram: string

  @Prop({
    type: String,
    enum: Gender,
  })
  gender: Gender

  @Prop()
  regionId: string

  @Prop()
  districtId: string

  @Prop()
  address: string

  @Prop()
  phone: string
}


export const UserSchema = SchemaFactory.createForClass(User);