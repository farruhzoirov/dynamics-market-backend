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
import { BuildCategoryHierarchyService } from 'src/shared/services/build-hierarchy.service';
@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly buildCategoryHierarchyService: BuildCategoryHierarchyService,
  ) {}

  async getCategoriesForFront(lang: string) {
    console.time('CategoriesService');
    const pipeline = await buildCategoryHierarchyPipeline(lang);
    const categories = await this.categoryModel.aggregate(pipeline).exec();
    console.timeEnd('CategoriesService');
    console.log('CategoriesService');
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
      const { hierarchyPath } =
        await this.buildCategoryHierarchyService.buildCategoryHierarchy(
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
    const customBody: {
      hierarchy?: IHierarchyPayload[];
      hierarchyPath?: string[];
    } = {};
    const findCategory = await this.categoryModel.findById(updateBody._id);
    if (!findCategory) {
      throw new ModelDataNotFoundByIdException('Category not found');
    }

    if (updateBody?.parentId !== findCategory.parentId.toString()) {
      const { hierarchyPath, hierarchy } =
        await this.buildCategoryHierarchyService.buildCategoryHierarchy(
          updateBody._id.toString(),
        );
      customBody.hierarchy = hierarchy;
      customBody.hierarchyPath = hierarchyPath;
    }

    const { nameUz, nameRu, nameEn } = updateBody;
    const slugUz = nameUz ? generateUniqueSlug(nameUz) : null;
    const slugRu = nameRu ? generateUniqueSlug(nameRu) : null;
    const slugEn = nameEn ? generateUniqueSlug(nameEn) : null;

    const forUpdateBody = {
      ...updateBody,
      ...customBody,
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
}
