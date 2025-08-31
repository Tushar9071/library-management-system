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
    return {
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
      },
    };
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    // console.log(body);

    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) throw new UnauthorizedException();
    const userInfo = await this.authService.login(user);

    // Set cookie with better options for cross-origin
    res.cookie('token', userInfo.access_token, { 
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });
    
    return {
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        role: userInfo.role,
        name: userInfo.name,
        token: userInfo.access_token, // Also return token in response for debugging
      },
    };
  }

  @Post('google-login')
  async googleLogin(
    @Body() body: { email: string; token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.googleLogin(body.email, body.token);
    res.cookie('token', result.access_token, { httpOnly: true });

    return {
      message: 'Google login successful',
      data: {
        id: result.id,
        email: result.email,
        role: result.role,
        name: result.name,
      },
    };
  }

  @Post('github-login')
  async githubLogin(
    @Body() body: { email: string; token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.githubLogin(body.email, body.token);
    res.cookie('token', result.access_token, { httpOnly: true });
    return {
      message: 'GitHub login successful',
      data: {
        id: result.id,
        email: result.email,
        role: result.role,
        name: result.name,
      },
    };
  }

  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.token;

    if (!token) {
      res.clearCookie('token');
      return {
        message: 'No active session found',
        data: null,
      };
    }

    res.clearCookie('token');
    const result = await this.authService.logout(token);
    return {
      message: result.message || 'Logged out successfully',
      data: null,
    };
  }
}
