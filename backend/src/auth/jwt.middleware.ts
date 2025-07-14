import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    const authHeader = req.headers['cookie'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split('=')[1];

    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      const decoded = this.jwtService.verify(token);
      req.user = decoded; // attach payload to request
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
