import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private user: UserService,
    private jwt: JwtService,
  ) {}

  async signIn(pass: string, email: string): Promise<{ access_token: string }> {
    const user = await this.user.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('密码或账号错误');
    }
    const existed = await bcrypt.compare(pass, user.password);
    if (!existed) {
      throw new UnauthorizedException('密码或账号错误');
    }
    const payload = { id: user.id, email: user.email };
    const token = this.jwt.sign(payload);
    return { access_token: token };
  }
}
