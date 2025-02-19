import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";

import {
  AddingModelException,
  CantDeleteModelException,
  ModelDataNotFoundByIdException
} from "../../../common/errors/model/model-based.exceptions";

import {generateUniqueSlug} from "../../../common/helpers/generate-slugs";
import {MidCategory, MidCategoryDocument} from "../schemas/mid-category.schema";
import {GetMidCategoryDto} from "../dto/min-category.dto";
import {IMidCategory} from "../interface/categories";
import {SubCategory, SubCategoryDocument} from "../schemas/sub-category.schema";
import {universalQueryBuilder} from "../../../common/helpers/universal-query-builder";

@Injectable()
export class MidCategoryService {
  constructor(
      @InjectModel(MidCategory.name) private readonly midCategoryModel: Model<MidCategoryDocument>,
      @InjectModel(SubCategory.name) private readonly subCategoryModel: Model<SubCategoryDocument>
  ) {
  }

  async getMidCategoriesList(body: GetMidCategoryDto) {
    const getMatchingMidCategories = await universalQueryBuilder(body,
        this.midCategoryModel,
        ['nameUz', 'nameRu', 'nameEn'],
        'mainCategory'
    );
    const total = getMatchingMidCategories.length;
    return {
      data: getMatchingMidCategories,
      total,
    }
  }

  async addMidCategory(body: IMidCategory) {
    try {
      const {nameUz, nameRu, nameEn} = body;
      body.slugUz = generateUniqueSlug(nameUz);
      body.slugRu = generateUniqueSlug(nameRu);
      body.slugEn = generateUniqueSlug(nameEn);
      if (body.parentId) {
        body.mainCategory = body.parentId;
      }
      await this.midCategoryModel.create(body);
    } catch (err) {
      console.log(`adding midCategory ====>  ${err.message}`);
      throw new AddingModelException();
    }
  }

  async updateMidCategory(updateBody: IMidCategory) {
    if (updateBody.nameUz) {
      updateBody.slugUz = generateUniqueSlug(updateBody.nameUz);
    }

    if (updateBody.nameRu) {
      updateBody.slugRu = generateUniqueSlug(updateBody.nameRu);
    }

    if (updateBody.nameEn) {
      updateBody.slugEn = generateUniqueSlug(updateBody.nameEn);
    }

    const updatedMidCategory = await this.midCategoryModel.findByIdAndUpdate(updateBody._id, {
      $set: {
        ...updateBody,
      }
    })

    if (!updatedMidCategory) {
      throw new ModelDataNotFoundByIdException("MidCategory not found");
    }
  }

  async deleteMidCategory(_id: string) {
    const findCategoryFromSubCategory = await this.subCategoryModel.findOne({midCategory: _id}).lean();
    if (findCategoryFromSubCategory) {
      throw new CantDeleteModelException()
    }
    await this.midCategoryModel.deleteOne({_id});
  }
}
