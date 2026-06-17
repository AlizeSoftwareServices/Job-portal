import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    sendRegistrationOtp(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    verifyAndRegister(body: any): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            email: string;
            firstName: string | null;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    login(body: any): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            email: string;
            firstName: string | null;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    sendForgotPasswordOtp(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: any): Promise<{
        message: string;
    }>;
}
