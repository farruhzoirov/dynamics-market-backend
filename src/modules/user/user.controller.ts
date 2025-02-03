import {Controller, HttpCode, HttpStatus, Post, Req, UseInterceptors} from '@nestjs/common';
import {UserService} from "./user.service";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {Request} from "express";


import {JwtPayload} from "../../shared/interfaces/jwt-payload";
import {CleanResponseInterceptor} from "../../shared/interceptors/clean-response";

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseInterceptors(CleanResponseInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @HttpCode(HttpStatus.OK)
  @Post('get-user-by-token')
  async getUserByToken(@Req() req: Request) {
    const user = req.user as JwtPayload;
    const getUser = await this.userService.getUserByToken(user.id);
    return getUser
  }
}
