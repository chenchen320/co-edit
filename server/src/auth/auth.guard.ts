import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('收到 OPTIONS 探测请求');
    if (request.method === 'OPTIONS') {
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('未携带身份凭证');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'my-secret-key-123',
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('凭证过期或无效');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
