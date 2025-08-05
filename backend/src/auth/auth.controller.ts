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
    // console.log(body);

    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException();
    const userInfo = await this.authService.login(user);

    res.cookie('token', userInfo.access_token, { httpOnly: true });
    return { id: user.id, email: user.email , role: userInfo.role };
  }

  @Post('google-login')
  async googleLogin(
    @Body() body: { email: string; token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.googleLogin(body.email, body.token);
    res.cookie('token', result.token, { httpOnly: true });
    return { 
      id: result.user.id, 
      email: result.user.email, 
      role: result.user.role,
      message: 'Google login successful' 
    };
  }

  @Post('github-login')
  async githubLogin(
    @Body() body: { email: string; token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.githubLogin(body.email, body.token);
    res.cookie('token', result.token, { httpOnly: true });
    return { 
      id: result.user.id, 
      email: result.user.email, 
      role: result.user.role,
      message: 'GitHub login successful' 
    };
  }

  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.token;
    
    if (!token) {
      res.clearCookie('token');
      return { message: 'No active session found' };
    }

    res.clearCookie('token');
    return this.authService.logout(token);
  }
}
