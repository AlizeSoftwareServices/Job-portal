import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Demo@123', 10);

  // 1. Create Demo Candidate
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@demo.com' },
    update: {},
    create: {
      email: 'candidate@demo.com',
      passwordHash,
      role: 'CANDIDATE',
      firstName: 'Demo',
      lastName: 'Candidate',
      phone: '1234567890',
      isVerified: true,
      candidateProfile: {
        create: {
          fullName: 'Demo Candidate',
          phone: '1234567890'
        }
      }
    }
  });

  // 2. Create Demo Employer
  const employer = await prisma.user.upsert({
    where: { email: 'employer@demo.com' },
    update: {},
    create: {
      email: 'employer@demo.com',
      passwordHash,
      role: 'EMPLOYER',
      firstName: 'Demo',
      lastName: 'Employer',
      phone: '9876543210',
      isVerified: true,
      employerProfile: {
        create: {
          companyName: 'Demo Corp',
          companyWebsite: 'https://demo.com',
          hrName: 'Demo Employer',
          industry: 'IT'
        }
      }
    }
  });

  console.log('Seed successful! Credentials:');
  console.log('Candidate: candidate@demo.com / Demo@123');
  console.log('Employer: employer@demo.com / Demo@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
