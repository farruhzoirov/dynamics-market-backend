import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {JwtModule, JwtService} from "@nestjs/jwt";
import {UserService} from "../user/user.service";
import {User, UserSchema} from "../user/schemas/user.schema";
import {MongooseModule} from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    JwtModule.register({
      secret: "node.js",
      signOptions: {
        expiresIn: '1w'
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,  JwtService],
})

export class AuthModule {
}
