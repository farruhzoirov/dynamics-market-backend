import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import * as jwt from 'jsonwebtoken';
import {User, UserDocument} from "../user/schemas/user.schema";

import { OAuth2Client } from 'google-auth-library';
import {ConfigService} from "@nestjs/config";

const client = new OAuth2Client();


@Injectable()
export class AuthService {
  constructor(
      private readonly configService: ConfigService,
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async verifyToken(id_token: string) {
    try {
      console.log('here')
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: this.configService.get('GOOGLE_BASED').GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new UnauthorizedException("Error while verifying token");
    }
  }

  async createJwtToken(payload: any) {
    return jwt.sign(payload, "JWT_SECRET", {expiresIn: "1w"});
  }
}




