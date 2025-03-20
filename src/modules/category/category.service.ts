import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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
import { Cache } from 'cache-manager';

import { IHierarchyPayload } from 'src/shared/interfaces/hierarchy-payload';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCategoriesForFront(body: GetCategoryDto, lang: string) {
    const parentId = body.parentId ?? null;
    const pipeline = [
      {
        $match: parentId
          ? {
              parentId: new mongoose.Types.ObjectId(parentId),
              isDeleted: false,
            }
          : { parentId: null, isDeleted: false },
      },
      ...(parentId
        ? [
            {
              $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: 'parentId',
                as: 'children',
              },
            },
            {
              $project: {
                _id: 1,
                name: `$name${lang}`,
                slug: `$slug${lang}`,
                children: {
                  $map: {
                    input: '$children',
                    as: 'child',
                    in: {
                      _id: '$$child._id',
                      name: `$$child.name${lang}`,
                      slug: `$$child.slug${lang}`,
                    },
                  },
                },
              },
            },
          ]
        : [
            {
              $project: {
                _id: 1,
                name: `$name${lang}`,
                slug: `$slug${lang}`,
              },
            },
          ]),
    ];

    const categories = await this.categoryModel.aggregate(pipeline).exec();
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
      console.log(`adding mainCategory ====>  ${err.message}`);
      throw new AddingModelException();
    }
  }

  async updateCategory(updateBody: UpdateCategoryDto) {
    const findCategory = await this.categoryModel.findById(updateBody._id);

    if (!findCategory) {
      throw new ModelDataNotFoundByIdException('Category not found');
    }

    const { nameUz, nameRu, nameEn } = updateBody;
    const slugUz = generateUniqueSlug(nameUz);
    const slugRu = generateUniqueSlug(nameRu);
    const slugEn = generateUniqueSlug(nameEn);

    const forUpdateBody = {
      ...updateBody,
      slugUz,
      slugRu,
      slugEn,
    };

    await this.categoryModel.findByIdAndUpdate(updateBody._id, {
      $set: {
        ...forUpdateBody,
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
