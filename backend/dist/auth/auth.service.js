"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const mail_service_1 = require("../mail/mail.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    mailService;
    jwtService;
    constructor(prisma, mailService, jwtService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.jwtService = jwtService;
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendRegistrationOtp(email) {
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists.');
        }
        const code = this.generateOtp();
        const expiresAt = new Date(Date.now() + 3 * 60000);
        await this.prisma.otpCode.create({
            data: { email, code, type: 'REGISTER', expiresAt }
        });
        this.mailService.sendRegistrationOtpEmail(email, code).catch(e => console.error('Email error:', e));
        return { message: 'OTP sent to your email.' };
    }
    async verifyAndRegister(data) {
        const { firstName, lastName, countryCode, phone, email, password, otp, role, companyName, secondaryContactNumber } = data;
        const otpRecord = await this.prisma.otpCode.findFirst({
            where: { email, code: otp, type: 'REGISTER' },
            orderBy: { createdAt: 'desc' }
        });
        if (!otpRecord)
            throw new common_1.BadRequestException('Invalid OTP.');
        if (otpRecord.expiresAt < new Date())
            throw new common_1.BadRequestException('OTP has expired.');
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser)
            throw new common_1.BadRequestException('User already exists.');
        const userRole = role === 'EMPLOYER' ? 'EMPLOYER' : 'CANDIDATE';
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                countryCode,
                phone,
                isVerified: true,
                role: userRole,
                ...(userRole === 'CANDIDATE' ? {
                    candidateProfile: {
                        create: {
                            fullName: `${firstName} ${lastName || ''}`.trim(),
                            phone: `${countryCode} ${phone}`,
                        }
                    }
                } : {
                    employerProfile: {
                        create: {
                            companyName: companyName || `${firstName} Company`,
                            contactPerson: `${firstName} ${lastName || ''}`.trim(),
                            secondaryContactNumber: secondaryContactNumber || null,
                        }
                    }
                })
            }
        });
        await this.prisma.otpCode.deleteMany({ where: { email, type: 'REGISTER' } });
        if (userRole === 'EMPLOYER') {
            try {
                const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
                if (admin) {
                    await this.mailService.sendAdminNewEmployerEmail(admin.email, companyName || `${firstName} Company`, `${firstName} ${lastName || ''}`.trim(), email);
                }
            }
            catch (e) {
                console.error('Failed to send admin notification for new employer', e);
            }
        }
        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
        return { message: 'Registration successful', token, user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role } };
    }
    async login(data) {
        const { email, password } = data;
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException('Account not found. Please sign up.');
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid password.');
        }
        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
        return { message: 'Login successful', token, user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role } };
    }
    async sendForgotPasswordOtp(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('Account not found. Please sign up.');
        const code = this.generateOtp();
        const expiresAt = new Date(Date.now() + 3 * 60000);
        await this.prisma.otpCode.create({
            data: { email, code, type: 'FORGOT_PASSWORD', expiresAt }
        });
        this.mailService.sendForgotPasswordOtpEmail(email, code).catch(e => console.error('Email error:', e));
        return { message: 'OTP sent to your email.' };
    }
    async resetPassword(data) {
        const { email, otp, newPassword } = data;
        const otpRecord = await this.prisma.otpCode.findFirst({
            where: { email, code: otp, type: 'FORGOT_PASSWORD' },
            orderBy: { createdAt: 'desc' }
        });
        if (!otpRecord)
            throw new common_1.BadRequestException('Invalid OTP.');
        if (otpRecord.expiresAt < new Date())
            throw new common_1.BadRequestException('OTP has expired.');
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { email },
            data: { passwordHash }
        });
        await this.prisma.otpCode.deleteMany({ where: { email, type: 'FORGOT_PASSWORD' } });
        return { message: 'Password reset successful.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map