import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    MailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_key_skyoconsultancy',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
