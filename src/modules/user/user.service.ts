import {Injectable, NotFoundException} from '@nestjs/common';
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";

import {User, UserDocument} from "./schemas/user.schema";

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

  async updateUser() {

  }

  async deleteUserById(userId: string) {

  }
}
