import {HttpException, HttpStatus, Injectable, NestMiddleware, UnauthorizedException} from '@nestjs/common';
import {NextFunction, Request, Response} from "express";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const bearerToken = req.headers?.authorization;
    const extractToken = bearerToken && bearerToken.split(' ')[1];

    if (!bearerToken || !extractToken) {
      throw new HttpException('No token provided', HttpStatus.BAD_REQUEST);
    }

    const payload = jwt.verify(extractToken, "JWT_SECRET");

    if (!payload) {
      throw new HttpException('token is no valid', HttpStatus.UNAUTHORIZED);
    }

    req.user = payload;
    next();
  }
}
