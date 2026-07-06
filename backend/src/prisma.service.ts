import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public application = prisma.application;
  public job = prisma.job;
  public user = prisma.user;
  public candidateProfile = prisma.candidateProfile;
  public employerProfile = prisma.employerProfile;
  public experience = prisma.experience;
  public education = prisma.education;
  public skill = prisma.skill;
  public certification = prisma.certification;
  public project = prisma.project;
  public interview = prisma.interview;
  public category = prisma.category;
  public otpCode = prisma.otpCode;

  async onModuleInit() {
    await prisma.$connect();
  }

  async onModuleDestroy() {
    await prisma.$disconnect();
  }
}
