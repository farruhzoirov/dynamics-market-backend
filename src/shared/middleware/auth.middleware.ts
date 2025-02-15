import {Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from "express";
import * as jwt from 'jsonwebtoken';
import {InvalidTokenException, NoTokenProvidedException} from "../errors/auth/auth.exception";
import {JwtPayload} from "jsonwebtoken";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const bearerToken = req.headers?.authorization;
    const extractToken = bearerToken && bearerToken.split(' ')[1];

    if (!bearerToken || !extractToken) {
      throw new NoTokenProvidedException("No token provided");
    }

    try {
      const payload = jwt.verify(extractToken, "JWT_SECRET");
      req.user = payload as JwtPayload;
      next();
    } catch (e) {
      throw new InvalidTokenException("Invalid token");
    }
  }
}
