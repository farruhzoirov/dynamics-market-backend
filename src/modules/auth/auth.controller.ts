import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { IdTokenDto } from './dto/id-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async auth(@Body() body: IdTokenDto) {
    const token = await this.authService.registerOrLoginUser(body.idToken);
    return {
      token: token,
    };
  }
}
