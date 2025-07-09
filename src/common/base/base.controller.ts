import { Request } from 'express';
import { AcceptLanguagePipe } from '../pipes/language.pipe';
import { AppType } from '../../shared/enums/app-type.enum';
import { BadRequestException } from '@nestjs/common';

export abstract class BaseController {
  protected extractHeadersInfo(req: Request): {
    lang: string;
    appType: string;
  } {
    const lang = new AcceptLanguagePipe().transform(
      req.headers['accept-language'],
    ) as string;
    const appType = req.headers['app-type'] as string;
    return { lang, appType };
  }

  protected async handleListRequest<A, U>(
    adminBasedBody: A,
    userBasedBody: U,
    appType: string,
    adminHandler: (body: A) => Promise<any>,
    userHandler: (body: U) => Promise<any>,
  ): Promise<any> {
    switch (appType) {
      case AppType.USER:
        return userHandler(userBasedBody);
      case AppType.ADMIN:
        return adminHandler(adminBasedBody);
      default:
        throw new BadRequestException('App type is not valid');
    }
  }
}
