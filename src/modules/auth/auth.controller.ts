import {Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {AuthService} from "./auth.service";
// import {GoogleOauthGuard} from "./guards/google-oauth.guard";
import {Request, Response} from "express";
import {AuthGuard} from "@nestjs/passport";
import {VerifyTokenDto} from "./dto/id_token.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('google')
  // @UseGuards(AuthGuard('google'))
  @UsePipes(ValidationPipe)
  async auth(@Body() body: VerifyTokenDto) {
    const profile = await this.authService.verifyToken(body.id_token);
    const token = await this.authService.createJwtToken({googleId: profile.sub, email: profile.email});
    return token;
  }
}


