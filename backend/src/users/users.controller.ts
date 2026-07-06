import { Controller, Get, Put, Delete, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudinaryResumeStorage, cloudinaryAvatarStorage } from '../cloudinary.config';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Delete('profile')
  deleteProfile(@Request() req: any) {
    return this.usersService.deleteProfile(req.user.id);
  }

  @Post('profile/resume')
  @UseInterceptors(FileInterceptor('file', {
    storage: cloudinaryResumeStorage,
    limits: {
      fileSize: 100 * 1024, // 100 KB max
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/msword'
      ];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only PDF and DOCX files are allowed'), false);
      }
    }
  }))
  uploadResume(@Request() req: any, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('File is required (Max 100KB, PDF/DOCX only)');
    const resumeUrl = file.path;
    return { resumeUrl };
  }

  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: cloudinaryAvatarStorage,
    limits: {
      fileSize: 50 * 1024, // 50 KB max
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only JPEG, JPG, and PNG files are allowed'), false);
      }
    }
  }))
  uploadAvatar(@Request() req: any, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('File is required (Max 50KB, JPEG/PNG only)');
    const avatarUrl = file.path;
    return { avatarUrl };
  }
}
