import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConnectAmocrmService } from './connect-amocrm.service';
import { AmocrmService } from './amocrm.service';

@Controller('amocrm')
export class AmocrmController {
  constructor(private readonly amocrmService: AmocrmService) {}

  @Get('code')
  async authorize(@Query('code') code: string, @Res() res: Response) {
    try {
      console.log(code);
      await this.amocrmService.authorizeWithCode(code);
      res.status(200).json({
        message: '✅ AmoCRM auth_code orqali muvaffaqiyatli ulanildi!',
      });
    } catch (error) {
      res.status(400).json({
        message: '❌ Auth_code bilan ulanib bo‘lmadi',
        error: error.message,
      });
    }
  }
}
