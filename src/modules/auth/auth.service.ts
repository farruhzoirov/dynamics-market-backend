import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../user/schemas/user.schema';
import { IJwtPayload } from '../../shared/interfaces/jwt-payload';
import { VerifyIdTokenException } from '../../common/errors/auth/verify-id-token.exception';

const client = new OAuth2Client();

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async verifyToken(id_token: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: this.configService.get('GOOGLE_BASED').GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      console.log('Error verifying token', error.message);
      throw new VerifyIdTokenException('Error verifying id token');
    }
  }

  async generateJwtToken(payload: IJwtPayload) {
    return jwt.sign(
      payload,
      this.configService.get('CONFIG_JWT').JWT_SECRET_KEY,
    );
  }

  async registerOrLoginUser(idToken: string): Promise<string> {
    const payload = await this.verifyToken(idToken);
    const checkUser = await this.userModel
      .findOne({ email: payload.email })
      .select('-__v -createdAt -updatedAt')
      .lean();

    if (!checkUser) {
      const newUser = await this.userModel.create({
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        image: payload.picture,
      });

      return await this.generateJwtToken({
        _id: newUser._id.toString(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        image: newUser.image,
        locations: [],
        gender: null,
        telegram: null,
        regionId: null,
        districtId: null,
        address: null,
        phone: null,
      });
    }

    return await this.generateJwtToken({
      ...checkUser,
      _id: checkUser._id.toString(),
    });
  }
}
