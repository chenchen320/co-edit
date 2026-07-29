import { AuthService } from './auth.service';
import { Logindto } from './dto/login.dto';
import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() Logindto: Logindto) {
    return this.authService.signIn(Logindto.password, Logindto.email);
  }
}
