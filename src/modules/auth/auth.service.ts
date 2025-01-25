import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import * as jwt from 'jsonwebtoken';
import {User, UserDocument} from "../user/schemas/user.schema";

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();



@Injectable()
export class AuthService {
  constructor(
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async verifyToken(id_token: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: ""
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new UnauthorizedException("Unable to verify token", error);
    }
  }

  async createJwtToken(payload: any) {
    return jwt.sign(payload, "JWT_SECRET", {expiresIn: "1w"});
  }
}




