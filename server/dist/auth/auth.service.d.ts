import { JwtService } from '@nestjs/jwt';
import { UserService } from "../user/user.service";
export declare class AuthService {
    private user;
    private jwt;
    constructor(user: UserService, jwt: JwtService);
    signIn(pass: string, email: string): Promise<{
        access_token: string;
    }>;
}
