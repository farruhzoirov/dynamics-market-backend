import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import * as jwt from 'jsonwebtoken';
import {OAuth2Client} from 'google-auth-library';
import {ConfigService} from "@nestjs/config";
// Schemas
import {User, UserDocument} from "../user/schemas/user.schema";

// Interfaces
import {JwtPayload} from "../../shared/interfaces/jwt-payload";

const client = new OAuth2Client();

@Injectable()
export class AuthService {
  constructor(
      private readonly configService: ConfigService,
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
  }

  async verifyToken(id_token: string) {
    try {
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

  async generateJwtToken(payload: JwtPayload) {
    return jwt.sign(payload, "JWT_SECRET", {expiresIn: "1w"});
  }

  async registerOrLoginUser(idToken: string): Promise<string> {
    const payload = await this.verifyToken(idToken);
    const checkUser = await this.userModel.findOne({email: payload.email});
    if (!checkUser) {
      const newUser = await this.userModel.create({
        name: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        image: payload.picture,
      });
      return await this.generateJwtToken({
        id: newUser._id.toString(),
        name: newUser.name,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      });
    }
    return await this.generateJwtToken({
      id: checkUser._id.toString(),
      name: checkUser.name,
      lastName: checkUser.lastName,
      email: checkUser.email,
      role: checkUser.role,
    });
  }
}




