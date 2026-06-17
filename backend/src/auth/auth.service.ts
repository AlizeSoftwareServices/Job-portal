import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  }

  async sendRegistrationOtp(email: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 3 * 60000); // 3 minutes

    // Store OTP
    await this.prisma.otpCode.create({
      data: { email, code, type: 'REGISTER', expiresAt }
    });

    // Send email
    await this.mailService.sendRegistrationOtpEmail(email, code);

    return { message: 'OTP sent to your email.' };
  }

  async verifyAndRegister(data: any) {
    const { firstName, lastName, countryCode, phone, email, password, otp } = data;

    // Verify OTP
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: { email, code: otp, type: 'REGISTER' },
      orderBy: { createdAt: 'desc' }
    });

    // Universal OTP bypass for testing without Gmail SMTP
    if (otp !== '123456') {
      if (!otpRecord) throw new BadRequestException('Invalid OTP.');
      if (otpRecord.expiresAt < new Date()) throw new BadRequestException('OTP has expired.');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('User already exists.');

    // Create user
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
        candidateProfile: {
          create: {
            fullName: `${firstName} ${lastName}`,
            phone: `${countryCode} ${phone}`,
          }
        }
      }
    });

    // Clean up OTPs
    await this.prisma.otpCode.deleteMany({ where: { email, type: 'REGISTER' } });

    // Generate token
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });

    return { message: 'Registration successful', token, user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role } };
  }

  async login(data: any) {
    const { email, password } = data;
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new NotFoundException('Account not found. Please sign up.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password.');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { message: 'Login successful', token, user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role } };
  }

  async sendForgotPasswordOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Account not found. Please sign up.');

    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 3 * 60000); // 3 minutes

    await this.prisma.otpCode.create({
      data: { email, code, type: 'FORGOT_PASSWORD', expiresAt }
    });

    await this.mailService.sendForgotPasswordOtpEmail(email, code);

    return { message: 'OTP sent to your email.' };
  }

  async resetPassword(data: any) {
    const { email, otp, newPassword } = data;

    const otpRecord = await this.prisma.otpCode.findFirst({
      where: { email, code: otp, type: 'FORGOT_PASSWORD' },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) throw new BadRequestException('Invalid OTP.');
    if (otpRecord.expiresAt < new Date()) throw new BadRequestException('OTP has expired.');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await this.prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    await this.prisma.otpCode.deleteMany({ where: { email, type: 'FORGOT_PASSWORD' } });

    return { message: 'Password reset successful.' };
  }
}
