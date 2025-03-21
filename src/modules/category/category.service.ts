import { Injectable } from '@nestjs/common';
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

import { IHierarchyPayload } from 'src/shared/interfaces/hierarchy-payload';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    // private readonly redisCategoryRepository: RedisCategoryRepository,
  ) {}

  async getCategoriesForFront(body: GetCategoryDto, lang: string) {
    const parentId = body.parentId ?? null;
    // const cacheKey = `categories:${String(parentId ?? 'root')}:${lang}`;

    // const cachedData: string | null =
    //   await this.redisCategoryRepository.get(cacheKey);

    // if (cachedData) {
    //   return { data: cachedData };
    // }
    const pipeline = [
      {
        $match: { parentId: null }, // Start with root categories (parentId is null)
      },
      {
        $graphLookup: {
          from: 'categories',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'allDescendants',
          maxDepth: 3, // Limit to 2 levels below root (3 levels total)
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: 'parentId',
          as: 'directChildren',
        },
      },
      {
        $project: {
          _id: 1,
          name: {
            $getField: { field: { $concat: ['name', lang] }, input: '$$ROOT' },
          },
          slug: {
            $getField: { field: { $concat: ['slug', lang] }, input: '$$ROOT' },
          },
          children: {
            $map: {
              input: '$directChildren',
              as: 'child',
              in: {
                _id: '$$child._id',
                name: {
                  $getField: {
                    field: { $concat: ['name', lang] },
                    input: '$$child',
                  },
                },
                slug: {
                  $getField: {
                    field: { $concat: ['slug', lang] },
                    input: '$$child',
                  },
                },
                children: {
                  $filter: {
                    input: '$allDescendants',
                    as: 'grandchild',
                    cond: { $eq: ['$$grandchild.parentId', '$$child._id'] },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          children: {
            $map: {
              input: '$children',
              as: 'child',
              in: {
                _id: '$$child._id',
                name: '$$child.name',
                slug: '$$child.slug',
                children: {
                  $map: {
                    input: '$$child.children',
                    as: 'grandchild',
                    in: {
                      _id: '$$grandchild._id',
                      name: {
                        $getField: {
                          field: { $concat: ['name', lang] },
                          input: '$$grandchild',
                        },
                      },
                      slug: {
                        $getField: {
                          field: { $concat: ['slug', lang] },
                          input: '$$grandchild',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ];
    const categories = await this.categoryModel.aggregate(pipeline).exec();
    // await this.redisCategoryRepository.set(cacheKey, categories, 300);
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
