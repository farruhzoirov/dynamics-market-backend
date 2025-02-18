import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';

import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {Request} from "express";

import {UserService} from "./user.service";
import {JwtPayload} from "../../shared/interfaces/jwt-payload";
import {CleanResponseInterceptor} from "../../common/interceptors/clean-response";

import {UpdateUserDto} from "./dto/user.dto";

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
    return req.user as JwtPayload;
    // const getUser = await this.userService.getUserByToken(user._id);
    // return getUser
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  @UsePipes(new ValidationPipe({whitelist: true}))
  async updateUserById(
      @Req() req: Request,
      @Body() body: UpdateUserDto) {
    const user = req.user as JwtPayload;
    const regeneratedJwtToken = await this.userService.updateUserById(user._id, body);
    return {
      token: regeneratedJwtToken,
    }
  }
}
