import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { getFilteredResultsWithTotal } from '../../common/helpers/universal-query-builder';
import { generateUniqueSlug } from '../../common/helpers/generate-slug';
import {
  AddingModelException,
  CantDeleteModelException,
  ModelDataNotFoundByIdException,
} from '../../common/errors/model/model-based.exceptions';
import {
  AddCategoryDto,
  GetCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { Product, ProductDocument } from '../product/schemas/product.model';
import { IHierarchyPayload } from 'src/shared/interfaces/hierarchy-payload';
import { buildCategoryHierarchyPipeline } from 'src/common/helpers/pipelines/category-hierarchy-pipeline';
import { RedisService } from 'src/shared/module/redis/redis.service';
@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly redisService: RedisService,
  ) {}

  async regenerateSlugsForCategories() {
    console.log('Sluglarni qayta generatsiya qilish boshlandi...');
    const categories = await this.categoryModel.find().lean();

    for (const category of categories) {
      const updatedSlugs: any = {};

      if (category.nameUz) {
        updatedSlugs.slugUz = generateUniqueSlug(category.nameUz);
      }
      if (category.nameRu) {
        updatedSlugs.slugRu = generateUniqueSlug(category.nameRu);
      }
      if (category.nameEn) {
        updatedSlugs.slugEn = generateUniqueSlug(category.nameEn);
      }

      await this.categoryModel.findByIdAndUpdate(category._id, {
        $set: updatedSlugs,
      });

      console.log(`Kategoriya yangilandi: ${category._id}`);
    }

    console.log('Sluglarni qayta generatsiya qilish tugadi.');
  }

  async getCategoriesForFront(body: GetCategoryDto, lang: string) {
    const cacheKey = `categories:${lang}`;
    const cachedData = await this.redisService.getData(cacheKey);
    if (cachedData) {
      return { data: cachedData };
    }
    const pipeline = await buildCategoryHierarchyPipeline(lang);
    const categories = await this.categoryModel.aggregate(pipeline).exec();
    await this.redisService.setData(cacheKey, categories);
    return { data: categories };
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
      const { nameUz, nameRu, nameEn } = body;
      const slugUz = generateUniqueSlug(nameUz);
      const slugRu = generateUniqueSlug(nameRu);
      const slugEn = generateUniqueSlug(nameEn);

      const createBody = {
        ...body,
        slugUz,
        slugRu,
        slugEn,
      };

      const newCategory = await this.categoryModel.create(createBody);
      const { hierarchyPath } = await this.buildCategoryHierarchy(
        newCategory._id.toString(),
      );
      newCategory.hierarchyPath = hierarchyPath;
      await newCategory.save();
    } catch (err) {
      console.log(`adding mainCategory ====>  ${err}`);
      throw new AddingModelException();
    }
  }

  async updateCategory(updateBody: UpdateCategoryDto) {
    const findCategory = await this.categoryModel.findById(updateBody._id);

    if (!findCategory) {
      throw new ModelDataNotFoundByIdException('Category not found');
    }

    const { nameUz, nameRu, nameEn } = updateBody;
    const slugUz = nameUz ? generateUniqueSlug(nameUz) : null;
    const slugRu = nameRu ? generateUniqueSlug(nameRu) : null;
    const slugEn = nameEn ? generateUniqueSlug(nameEn) : null;

    const forUpdateBody = {
      ...updateBody,
      ...(slugUz && { slugUz }),
      ...(slugRu && { slugRu }),
      ...(slugEn && { slugEn }),
    };

    await this.categoryModel.findByIdAndUpdate(updateBody._id, {
      $set: forUpdateBody,
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
    await this.categoryModel.updateOne({ _id }, { isDeleted: true });
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
