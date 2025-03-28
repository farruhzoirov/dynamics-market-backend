import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { IJwtPayload } from '../interfaces/jwt-payload';

import {
  InvalidTokenException,
  NoTokenProvidedException,
} from '../../common/errors/auth/auth.exception';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const bearerToken = req.headers?.authorization;
    const extractToken = bearerToken && bearerToken.split(' ')[1];

    if (!bearerToken || !extractToken) {
      throw new NoTokenProvidedException('No token provided');
    }

    try {
      const payload = jwt.verify(
        extractToken,
        this.configService.get('CONFIG_JWT').JWT_SECRET_KEY,
      );

      req.user = payload as IJwtPayload;
      next();
    } catch (e) {
      throw new InvalidTokenException('Invalid token');
    }
  }
}
