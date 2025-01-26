import {Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe} from '@nestjs/common';
import {AuthService} from "./auth.service";
// import {GoogleOauthGuard} from "./guards/google-oauth.guard";
import {VerifyTokenDto} from "./dto/id_token.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard('google'))
  @UsePipes(ValidationPipe)
  async auth(@Body() body: VerifyTokenDto) {
    const profile = await this.authService.verifyToken(body.id_token);
    const token = await this.authService.createJwtToken({email: profile.email,
      name: profile.name,
      picture: profile.picture,
      given_name: profile.given_name,
      family_name: profile.family_name
    });
    return token;
  }
}


