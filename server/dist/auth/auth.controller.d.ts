import { AuthService } from './auth.service';
import { Logindto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(Logindto: Logindto): Promise<{
        access_token: string;
    }>;
}
