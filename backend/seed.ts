import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.category.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin_seed@nexusjobs.com',
      passwordHash: 'dummyhash123',
      role: 'ADMIN',
      isVerified: true
    }
  });

  // Create candidate
  const candidate = await prisma.user.create({
    data: {
      email: 'johndoe@example.com',
      passwordHash: 'dummyhash123',
      role: 'CANDIDATE',
      isVerified: true,
      candidateProfile: {
        create: {
          fullName: 'John Doe',
          phone: '+1 234 567 8900',
          summary: 'Experienced Professional',
          expectedSalary: '$80,000',
        }
      }
    }
  });

  const uniqueJobs = [
    {
      title: 'Senior React Developer',
      categoryName: 'Technology & IT',
      categoryImg: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',
      desc: 'Build next-gen web applications using React and Next.js.'
    },
    {
      title: 'Full Stack Engineer',
      categoryName: 'Technology & IT',
      categoryImg: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',
      desc: 'Work on both backend and frontend systems using Node and React.'
    },
    {
      title: 'Investment Banker',
      categoryName: 'Finance & Banking',
      categoryImg: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
      desc: 'Manage portfolios and analyze financial trends.'
    },
    {
      title: 'Financial Analyst',
      categoryName: 'Finance & Banking',
      categoryImg: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
      desc: 'Provide financial forecasting, reporting, and operational metrics tracking.'
    },
    {
      title: 'Clinical Nurse',
      categoryName: 'Healthcare',
      categoryImg: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=500&q=80',
      desc: 'Provide high quality patient care in a fast-paced environment.'
    },
    {
      title: 'Digital Marketing Manager',
      categoryName: 'Marketing & Sales',
      categoryImg: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=500&q=80',
      desc: 'Lead our SEO and SEM efforts globally.'
    },
    {
      title: 'Mechanical Engineer',
      categoryName: 'Engineering',
      categoryImg: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&q=80',
      desc: 'Design and manufacture innovative mechanical systems.'
    },
    {
      title: 'Civil Engineer',
      categoryName: 'Engineering',
      categoryImg: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&q=80',
      desc: 'Plan and oversee construction of infrastructure projects.'
    },
    {
      title: 'HR Business Partner',
      categoryName: 'Human Resources',
      categoryImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80',
      desc: 'Align business objectives with employees and management.'
    },
    {
      title: 'Customer Success Manager',
      categoryName: 'Customer Support',
      categoryImg: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=500&q=80',
      desc: 'Ensure our customers achieve their desired outcomes.'
    },
    {
      title: 'UX/UI Designer',
      categoryName: 'Design',
      categoryImg: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80',
      desc: 'Create beautiful, intuitive user interfaces.'
    }
  ];

  // Ensure categories exist
  const categoriesMap = new Map();
  for (const jobData of uniqueJobs) {
    if (!categoriesMap.has(jobData.categoryName)) {
      const cat = await prisma.category.upsert({
        where: { name: jobData.categoryName },
        update: { imageUrl: jobData.categoryImg },
        create: { name: jobData.categoryName, imageUrl: jobData.categoryImg }
      });
      categoriesMap.set(jobData.categoryName, cat.id);
    }
  }

  for (let i = 0; i < uniqueJobs.length; i++) {
    const jobData = uniqueJobs[i];
    await prisma.job.create({
      data: {
        jobCode: `JOB-00${i+1}`,
        title: jobData.title,
        categoryId: categoriesMap.get(jobData.categoryName),
        locationCity: ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune'][i % 5],
        locationState: ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Maharashtra'][i % 5],
        experienceLevel: i % 2 === 0 ? '3-5 Years' : '1-3 Years',
        workMode: i % 3 === 0 ? 'Remote' : 'Hybrid',
        jobType: 'Full Time',
        description: jobData.desc,
        requirements: 'Relevant degree and experience required.',
        createdByAdminId: admin.id
      }
    });
  }

  // Fetch the first job to apply to
  const firstJob = await prisma.job.findFirst();

  if (firstJob) {
    // Create application
    await prisma.application.create({
      data: {
        jobId: firstJob.id,
        candidateId: candidate.id,
        status: 'UNDER_REVIEW',
        resumeUrl: '/uploads/resumes/dummy.pdf',
        referenceNumber: 'NEX-7A2-K9Q'
      }
    });
  }

  console.log('Database seeded with unique category jobs successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
