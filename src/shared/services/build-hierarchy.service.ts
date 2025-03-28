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
    hierarchyPath: string[];
    hierarchy: IHierarchyPayload[];
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

    while (currentCategory.parentId !== null) {
      hierarchyPath.unshift(currentCategory.parentId.toString());
      currentCategory = await this.categoryModel
        .findById(currentCategory.parentId.toString())
        .exec();

      if (!currentCategory) {
        break;
      }

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
