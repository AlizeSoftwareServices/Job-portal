import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/send-otp')
  @HttpCode(HttpStatus.OK)
  sendRegistrationOtp(@Body() body: { email: string }) {
    return this.authService.sendRegistrationOtp(body.email);
  }

  @Post('register/verify')
  verifyAndRegister(@Body() body: any) {
    return this.authService.verifyAndRegister(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('forgot-password/send-otp')
  @HttpCode(HttpStatus.OK)
  sendForgotPasswordOtp(@Body() body: { email: string }) {
    return this.authService.sendForgotPasswordOtp(body.email);
  }

  @Post('forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body);
  }
}
