import { Request } from 'express';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { JwtPayload } from '../../shared/interfaces/jwt-payload';
import { UpdateUserDto } from './dto/user.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Post('get-user-by-token')
  async getUserByToken(@Req() req: Request) {
    return req.user as JwtPayload;
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateUserById(@Req() req: Request, @Body() body: UpdateUserDto) {
    const user = req.user as JwtPayload;
    const regeneratedJwtToken = await this.userService.updateUserById(
      user._id,
      body,
    );
    return {
      token: regeneratedJwtToken,
    };
  }
}
