import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: any): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateCategoryDto: any): Promise<any>;
    remove(id: string): Promise<any>;
    uploadImage(file: any): {
        imageUrl: any;
    };
}
