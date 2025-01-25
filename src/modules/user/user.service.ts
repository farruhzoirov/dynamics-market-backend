import {Injectable} from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
      // @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {
  }


  // async findByEmail(email: string): Promise<User> {
  //   // return this.userModel.findOne({email});
  // }
  //
  // async create(userData: Partial<User> ): Promise<User> {
  //   return;
  // }
}
