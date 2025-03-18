import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Category, CategoryDocument} from './schemas/category.schema';
import {getFilteredResultsWithTotal} from '../../common/helpers/universal-query-builder';
import {generateUniqueSlug} from '../../common/helpers/generate-slug';
import {
  AddingModelException,
  CantDeleteModelException,
  ModelDataNotFoundByIdException,
} from '../../common/errors/model/model-based.exceptions';
import {AddCategoryDto, GetCategoryDto, UpdateCategoryDto,} from './dto/category.dto';
import {Product, ProductDocument} from '../product/schemas/product.model';
import {IHierarchyPayload} from 'src/shared/interfaces/hierarchy-payload';

@Injectable()
export class CategoryService {
  constructor(
      @InjectModel(Category.name)
      private readonly categoryModel: Model<CategoryDocument>,
      @InjectModel(Product.name)
      private readonly productModel: Model<ProductDocument>,
  ) {
  }

  async getCategoriesForFront(language: string) {
  }

  async getCategoriesList(body: GetCategoryDto) {
    if (!body.parentId) {
      body.parentId = null;
    }
    const [data, total] = await getFilteredResultsWithTotal(
        body,
        this.categoryModel,
        ['nameUz', 'nameRu', 'nameEn'],
    );

    return {
      data,
      total,
    };
  }

  async addCategory(body: AddCategoryDto) {
    try {
      const {nameUz, nameRu, nameEn} = body;
      body.slugUz = generateUniqueSlug(nameUz);
      body.slugRu = generateUniqueSlug(nameRu);
      body.slugEn = generateUniqueSlug(nameEn);
      const newCategory = await this.categoryModel.create(body);
      const {hierarchyPath} = await this.buildCategoryHierarchy(
          newCategory._id.toString(),
      );
      newCategory.hierarchyPath = hierarchyPath;
      await newCategory.save();
    } catch (err) {
      console.log(`adding mainCategory ====>  ${err.message}`);
      throw new AddingModelException();
    }
  }

  async updateCategory(updateBody: UpdateCategoryDto) {
    const languages = ['Uz', 'Ru', 'En'];
    languages.forEach((lang) => {
      const nameKey = `name${lang}`;
      const slugKey = `slug${lang}`;

      if (updateBody[nameKey]) {
        updateBody[slugKey] = generateUniqueSlug(updateBody[nameKey]);
      }
    });

    const findCategory = await this.categoryModel.findById(updateBody._id);

    if (!findCategory) {
      throw new ModelDataNotFoundByIdException('Category not found');
    }
    await this.categoryModel.findByIdAndUpdate(updateBody._id, {
      $set: {
        updateBody,
      },
    });
  }

  async deleteCategory(_id: string) {
    const checkCategory = await this.categoryModel.findById(_id);
    if (!checkCategory) {
      throw new ModelDataNotFoundByIdException('Category not found');
    }
    const hasChildren = await this.categoryModel.exists({
      parentId: _id,
      isDeleted: false,
    });

    if (hasChildren) {
      throw new CantDeleteModelException();
    }

    const hasProducts = await this.productModel.exists({
      categoryId: _id,
      isDeleted: false,
    });
    if (hasProducts) {
      throw new CantDeleteModelException(
          'Cannot delete category with linked products',
      );
    }
    await this.categoryModel.updateOne({_id}, {isDeleted: true});
  }

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
