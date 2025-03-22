import { Injectable } from '@nestjs/common';
import { IHierarchyPayload } from '../interfaces/hierarchy-payload';
import { InjectModel } from '@nestjs/mongoose';
import {
  Category,
  CategoryDocument,
} from 'src/modules/category/schemas/category.schema';
import { Model } from 'mongoose';

@Injectable()
export class BuildCategoryHierarchyService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}
  async buildCategoryHierarchy(categoryId: string): Promise<{
    hierarchy: IHierarchyPayload[];
    hierarchyPath: string[];
  }> {
    const hierarchy: IHierarchyPayload[] = [];
    const hierarchyPath: string[] = [];
    let currentCategory: CategoryDocument | null = await this.categoryModel
      .findById(categoryId)
      .exec();

    hierarchyPath.push(currentCategory._id.toString());
    hierarchy.push({
      categoryId: currentCategory._id.toString(),
      categoryNameUz: currentCategory.nameUz,
      categoryNameRu: currentCategory.nameRu,
      categoryNameEn: currentCategory.nameEn,
      categorySlugUz: currentCategory.slugUz,
      categorySlugRu: currentCategory.slugRu,
      categorySlugEn: currentCategory.slugEn,
    });

    while (currentCategory.parentId) {
      hierarchyPath.unshift(currentCategory.parentId.toString());
      currentCategory = await this.categoryModel
        .findById(currentCategory.parentId.toString())
        .exec();
      hierarchy.unshift({
        categoryId: currentCategory._id.toString(),
        categoryNameUz: currentCategory.nameUz,
        categoryNameRu: currentCategory.nameRu,
        categoryNameEn: currentCategory.nameEn,
        categorySlugUz: currentCategory.slugUz,
        categorySlugRu: currentCategory.slugRu,
        categorySlugEn: currentCategory.slugEn,
      });
    }

    return {
      hierarchyPath,
      hierarchy,
    };
  }
}
