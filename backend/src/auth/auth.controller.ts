import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  async signup(@Body() body: any) {
    const { email, password, userInfo } = body;
    const user = await this.usersService.createUser(email, password, userInfo);
    return { id: user.id, email: user.email };
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    console.log(body);

    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException();
    const { access_token } = await this.authService.login(user);

    res.cookie('token', access_token, { httpOnly: true });
    return { id: user.id, email: user.email };
  }

  @Post('logout')
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.sub);
  }
}
