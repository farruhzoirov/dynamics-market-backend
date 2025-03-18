import {Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {User, UserDocument} from './schemas/user.schema';
import {UpdateUserDto} from './dto/user.dto';
import {UpdatingModelException} from '../../common/errors/model/model-based.exceptions';
import * as jwt from 'jsonwebtoken';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
      private readonly configService: ConfigService,
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
  }

  async getAllUsers() {
  }

  async getUserById(userId: string) {
  }

  async updateUserById(id: string, body: UpdateUserDto) {
    try {
      const updateUser = await this.userModel
          .findByIdAndUpdate(id, {$set: body}, {new: true})
          .lean();
      // Regenerate jwt token
      return jwt.sign(
          updateUser,
          this.configService.get('CONFIG_JWT').JWT_SECRET_KEY,
      );
    } catch (err) {
      console.error('Error updating user', err.message);
      throw new UpdatingModelException('Error updating user');
    }
  }

  async deleteUserById(userId: string) {
  }
}
