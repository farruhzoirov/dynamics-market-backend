import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {
  AddingModelException,
  CantDeleteModelException,
  DeletingModelException,
  UpdatingModelException
} from "../../../common/errors/model/model-based.exceptions";

import {MainCategory, MainCategoryDocument} from "../schemas/main-category.schema";
import {CreateMainCategoryDto, GetMainCategoryDto, UpdateMainCategoryDto} from "../dto/main-category.dto";
import {generateUniqueSlug} from "../../../common/helpers/generate-slugs";
import {MidCategory, MidCategoryDocument} from "../schemas/mid-category.schema";
import {universalQueryBuilder} from "../../../common/helpers/universal-query-builder";

@Injectable()
export class MainCategoryService {
  constructor(
      @InjectModel(MainCategory.name) private readonly mainCategoryModel: Model<MainCategoryDocument>,
      @InjectModel(MidCategory.name) private readonly midCategoryModel: Model<MidCategoryDocument>
  ) {
  }

  async getMainCategoriesList(body: GetMainCategoryDto) {
    const getMatchingMainCategories = await universalQueryBuilder(body, this.mainCategoryModel, ['nameUz', 'nameRu', 'nameEn'])
    const total = await this.mainCategoryModel.countDocuments();
    return {
      data: getMatchingMainCategories,
      total,
    }
  }

  async addMainCategory(body: CreateMainCategoryDto) {
    try {
      const {nameUz, nameRu, nameEn} = body;
      body.slugUz = generateUniqueSlug(nameUz);
      body.slugRu = generateUniqueSlug(nameRu);
      body.slugEn = generateUniqueSlug(nameEn);
      await this.mainCategoryModel.create(body);
    } catch (err) {
      console.log(`adding mainCategory ====>  ${err.message}`);
      throw new AddingModelException();
    }
  }

  async updateMainCategory(updateBody: UpdateMainCategoryDto) {
    try {
      if (updateBody.nameUz) {
        updateBody.slugUz = generateUniqueSlug(updateBody.nameUz);
      }

      if (updateBody.nameRu) {
        updateBody.slugRu = generateUniqueSlug(updateBody.nameRu);
      }

      if (updateBody.nameEn) {
        updateBody.slugEn = generateUniqueSlug(updateBody.nameEn);
      }

      await this.mainCategoryModel.findByIdAndUpdate(updateBody._id, {
        $set: {
          ...updateBody,
        }
      })
    } catch (err) {
      console.log(`updating mainCategory ====>  ${err.message}`);
      throw new UpdatingModelException();
    }
  }

  async deleteMainCategory(_id: string) {
    try {
      const findCategoryFromMidCategory = await this.midCategoryModel.findOne({mainCategory: _id}).lean();
      if (findCategoryFromMidCategory) {
        return new CantDeleteModelException();
      }
      await this.mainCategoryModel.deleteOne({_id});
    } catch (err) {
      console.log(`deleting mainCategory ====>  ${err.message}`);
      throw new DeletingModelException();
    }
  }
}
