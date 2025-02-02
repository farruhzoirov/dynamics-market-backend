import {Injectable} from '@nestjs/common';
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";

import {User, UserDocument} from "./schemas/user.schema";

@Injectable()
export class UserService {
  constructor(
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async getUserByToken(email: string) {
    return this.userModel.findOne({email}).lean();
  }

  async getAllUsers() {

  }

  async getUserById(userId: string){

  }

  async updateUser() {

  }

  async deleteUserById(userId: string){

  }
}
