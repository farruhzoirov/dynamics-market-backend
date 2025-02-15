import {Injectable, NotFoundException} from '@nestjs/common';
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";

import {User, UserDocument} from "./schemas/user.schema";
import {UpdateUserDto} from "./dto/user.dto";
import {UpdatingModelException} from "../../shared/errors/model/model-based.exceptions";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {
  }

  async getUserByToken(userId: string) {
    const findUser = await this.userModel.findById({_id: userId}).lean();
    if (!findUser) {
      throw new NotFoundException("User not found");
    }
    return findUser;
  }

  async getAllUsers() {

  }

  async getUserById(userId: string) {

  }

  async updateUserById(id: string, body: UpdateUserDto) {
    try {
      if (body.email) {
        delete body.email;
      }
      console.log(body);
      const updateUser = await this.userModel.findByIdAndUpdate(id,
          {$set: body},
          {new: true}
      ).lean();
      // Regenerate jwt token
      return jwt.sign(updateUser, 'JWT_SECRET');
    } catch (err) {
      console.error('Error updating user', err.message);
      throw new UpdatingModelException('Error updating user');
    }
  }

  async deleteUserById(userId: string) {

  }
}
