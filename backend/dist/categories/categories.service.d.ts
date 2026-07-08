import { PrismaService } from '../prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCategoryDto: any): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateCategoryDto: any): Promise<any>;
    remove(id: string): Promise<any>;
}
