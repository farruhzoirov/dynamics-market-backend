import {Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from "express";
import * as jwt from 'jsonwebtoken';
import {JwtPayload} from 'jsonwebtoken';
import {InvalidTokenException, NoTokenProvidedException} from "../../common/errors/auth/auth.exception";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {
  }

  use(req: Request, res: Response, next: NextFunction) {
    const bearerToken = req.headers?.authorization;
    const extractToken = bearerToken && bearerToken.split(' ')[1];

    if (!bearerToken || !extractToken) {
      throw new NoTokenProvidedException("No token provided");
    }

    try {
      const payload = jwt.verify(extractToken, this.configService.get('CONFIG_JWT').JWT_SECRET_KEY);
      req.user = payload as JwtPayload;
      next();
    } catch (e) {
      throw new InvalidTokenException("Invalid token");
    }
  }
}
