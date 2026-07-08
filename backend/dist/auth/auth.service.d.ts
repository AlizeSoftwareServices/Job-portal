import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private mailService;
    private jwtService;
    constructor(prisma: PrismaService, mailService: MailService, jwtService: JwtService);
    private generateOtp;
    sendRegistrationOtp(email: string): Promise<{
        message: string;
    }>;
    verifyAndRegister(data: any): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            email: string;
            firstName: string | null;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    login(data: any): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            email: string;
            firstName: string | null;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    sendForgotPasswordOtp(email: string): Promise<{
        message: string;
    }>;
    resetPassword(data: any): Promise<{
        message: string;
    }>;
}
