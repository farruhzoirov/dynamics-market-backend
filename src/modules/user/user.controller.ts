import {Body, Controller, Get} from '@nestjs/common';
import {UserService} from "./user.service";
import {UserDto} from "../auth/dto/user.dto";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService){}


  @Get()
  async getUserByToken(@Body() body: UserDto){

  }
}
