import {Injectable} from '@nestjs/common';
import {Model} from "mongoose";
import {User, UserDocument} from './schemas/user.schema'
import {InjectModel} from "@nestjs/mongoose";

@Injectable()
export class UserService {
  constructor(
    // @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  // async findByEmail(email: string): Promise<User> {
  //   // return this.userModel.findOne({email});
  // }
  //
  // async create(userData: Partial<User> ): Promise<User> {
  //   return;
  // }
}
