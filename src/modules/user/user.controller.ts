import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseInterceptors, UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {ApiBearerAuth, ApiParam, ApiTags} from "@nestjs/swagger";
import {Request} from "express";

import {UserService} from "./user.service";
import {JwtPayload} from "../../shared/interfaces/jwt-payload";
import {CleanResponseInterceptor} from "../../shared/interceptors/clean-response";

import {UpdateUserDto} from "./dto/user.dto";
import {ValidateObjectIdPipe} from "../../shared/pipes/object-id.pipe";

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

  @HttpCode(HttpStatus.OK)
  @Post('update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateUserById(
      @Param('id', new ValidateObjectIdPipe()) id: string,
      @Body() body: UpdateUserDto) {
    const regeneratedJwtToken = await this.userService.updateUserById(id, body);
    return {
      token: regeneratedJwtToken,
    }
  }
}
