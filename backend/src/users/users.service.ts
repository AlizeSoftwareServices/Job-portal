import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidateProfile: {
          include: {
            experiences: true,
            educations: true,
            skills: true,
            projects: true,
            certifications: true
          }
        }
      }
    });

    if (!user) throw new NotFoundException('User not found');
    
    // Omit sensitive data
    const { passwordHash, refreshToken, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, data: any) {
    let emailChanged = false;

    // Check email
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
      if (existingUser && existingUser.email !== data.email) {
        const emailTaken = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (emailTaken) {
          throw new BadRequestException('Email is already taken');
        }
        emailChanged = true;
      }
    }

    // User-level fields
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone && { phone: data.phone }),
        ...(data.countryCode && { countryCode: data.countryCode }),
        ...(data.email && { email: data.email })
      }
    });

    // Profile-level fields
    const updatedProfile = await this.prisma.candidateProfile.update({
      where: { userId },
      data: {
        ...(data.firstName && data.lastName && { fullName: `${data.firstName} ${data.lastName}` }),
        ...((data.phone || data.countryCode) && { phone: `${data.countryCode || ''} ${data.phone || ''}`.trim() }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.resumeUrl !== undefined && { resumeUrl: data.resumeUrl }),
        ...(data.expectedSalary !== undefined && { expectedSalary: data.expectedSalary }),
        ...(data.preferredLocation !== undefined && { preferredLocation: data.preferredLocation }),
        ...(data.preferredJobType !== undefined && { preferredJobType: data.preferredJobType }),
      }
    });

    // Handle nested arrays (Educations, Experiences, Skills)
    if (data.educations && Array.isArray(data.educations)) {
      await this.prisma.education.deleteMany({ where: { profileId: updatedProfile.id } });
      if (data.educations.length > 0) {
        await this.prisma.education.createMany({
          data: data.educations.map((edu: any) => ({
            profileId: updatedProfile.id,
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
          }))
        });
      }
    }

    if (data.experiences && Array.isArray(data.experiences)) {
      await this.prisma.experience.deleteMany({ where: { profileId: updatedProfile.id } });
      if (data.experiences.length > 0) {
        await this.prisma.experience.createMany({
          data: data.experiences.map((exp: any) => ({
            profileId: updatedProfile.id,
            company: exp.company,
            title: exp.title,
            description: exp.description,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
          }))
        });
      }
    }

    if (data.skills && Array.isArray(data.skills)) {
      await this.prisma.skill.deleteMany({ where: { profileId: updatedProfile.id } });
      if (data.skills.length > 0) {
        await this.prisma.skill.createMany({
          data: data.skills.map((skill: string) => ({
            profileId: updatedProfile.id,
            name: skill,
          }))
        });
      }
    }

    return { message: 'Profile updated successfully', emailChanged, profile: updatedProfile };
  }

  async deleteProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    await this.prisma.user.delete({
      where: { id: userId }
    });

    return { message: 'Account deleted successfully' };
  }
}
