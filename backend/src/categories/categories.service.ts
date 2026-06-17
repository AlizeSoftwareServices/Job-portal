import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: any) {
    return (this.prisma as any).category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    // Fetch categories with active job counts
    const categories = await (this.prisma as any).category.findMany({
      include: {
        _count: {
          select: { jobs: { where: { status: 'ACTIVE' } } }
        }
      }
    });

    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      imageUrl: cat.imageUrl,
      jobCount: cat._count.jobs
    }));
  }

  async findOne(id: string) {
    return (this.prisma as any).category.findUnique({ where: { id } });
  }

  async update(id: string, updateCategoryDto: any) {
    return (this.prisma as any).category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    return (this.prisma as any).category.delete({ where: { id } });
  }
}
