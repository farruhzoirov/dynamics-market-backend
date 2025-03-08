import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { getFilteredResultsWithTotal } from '../../common/helpers/universal-query-builder';
import { generateUniqueSlug } from '../../common/helpers/generate-slugs';

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
import { LanguagesEnum } from '../user/enums/language.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getCategoriesForFront(language: string) {
    let select: string;

    if (
      language &&
      !Object.values(LanguagesEnum).includes(language as LanguagesEnum)
    ) {
      return {};
    }

    switch (language) {
      case LanguagesEnum.UZ:
        select = '$nameUz';
        break;
      case LanguagesEnum.RU:
        select = '$nameRu';
        break;
      case LanguagesEnum.EN:
        select = '$nameEn';
        break;
      default:
        select = `$nameUz`;
    }

    const categories = await this.categoryModel.aggregate([
      {
        $graphLookup: {
          from: 'categories',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'children',
        },
      },
      {
        $project: {
          _id: 1,
          name: select,
          parentId: 1,
          children: {
            _id: 1,
            name: select,
            parentId: 1,
          },
        },
      },
      {
        $match: { parentId: null },
      },
    ]);

    return categories;
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
      body.slugUz = generateUniqueSlug(nameUz);
      body.slugRu = generateUniqueSlug(nameRu);
      body.slugEn = generateUniqueSlug(nameEn);
      await this.categoryModel.create(body);
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
        ...updateBody,
      },
    });
  }

  async deleteCategory(_id: string) {
    const checkCategory = await this.categoryModel.findById(_id);
    if (!checkCategory) {
      throw new ModelDataNotFoundByIdException('Category not found');
    }
    const hasChildren = await this.categoryModel.exists({ parentId: _id });

    if (hasChildren) {
      throw new CantDeleteModelException();
    }

    const hasProducts = await this.productModel.exists({ categoryId: _id });
    if (hasProducts) {
      throw new CantDeleteModelException(
        'Cannot delete category with linked products',
      );
    }
    await this.categoryModel.updateOne({ isDeleted: true });
  }
}
