import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ContactDto } from './dto/contact.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async postContact(@Body() body: ContactDto, @Res() res: Response) {
    await this.contactService.postContact(body);
    res
      .status(200)
      .json({ success: true, message: 'Message sent successfully' });
  }
}
