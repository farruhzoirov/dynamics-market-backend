import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";

import {
  AddingModelException, CantDeleteModelException,
  DeletingModelException,
  UpdatingModelException
} from "../../../shared/errors/model/model-based.exceptions";

import {universalSearchSchema} from "../../../shared/helpers/search";
import {generateUniqueSlug} from "../../../shared/helpers/generate-slugs";
import {MidCategory, MidCategoryDocument} from "../schemas/mid-category.schema";
import {GetMidCategoryDto} from "../dto/min-category.dto";
import {IMidCategory} from "../interface/categories";
import {SubCategory, SubCategoryDocument} from "../schemas/sub-category.schema";

@Injectable()
export class MidCategoryService {
  constructor(
      @InjectModel(MidCategory.name) private readonly midCategoryModel: Model<MidCategoryDocument>,
      @InjectModel(SubCategory.name) private readonly subCategoryModel: Model<SubCategoryDocument>
  ) {
  }

  async getMinCategoriesList(body: GetMidCategoryDto) {
    const payload = {
      page: body?.page ? body.page : 1,
      limit: body?.limit ? body.limit : null,
      select: body?.select ? body.select.split(",") : null,
      search: body?.search || null,
    }
    const skip = (payload.page - 1) * payload.limit;
    const filter = await universalSearchSchema(payload.search, ['nameUz', 'nameRu', 'nameEn']);
    const getMatchingMidCategories = await this.midCategoryModel
        .find(filter)
        .skip(skip)
        .limit(payload.limit)
        .select(payload.select ? payload.select : "-__v")
        .lean();
    const total = await this.midCategoryModel.countDocuments();
    return {
      data: getMatchingMidCategories,
      total,
    }
  }

  async addMinCategory(body: IMidCategory) {
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

      if (updateBody.parentId) {
        updateBody.mainCategory = updateBody.parentId;
      }

      await this.midCategoryModel.findByIdAndUpdate(updateBody._id, {
        $set: {
          ...updateBody,
        }
      })
    } catch (err) {
      console.log(`updating midCategory ====>  ${err.message}`);
      throw new UpdatingModelException();
    }
  }

  async deleteMidCategory(_id: string) {
    try {
      const findCategoryFromSubCategory = await this.subCategoryModel.findOne({midCategory: _id}).lean();
      if (findCategoryFromSubCategory) {
        throw new CantDeleteModelException()
      }
      await this.midCategoryModel.deleteOne({_id});

    } catch (err) {
      console.log(`deleting midCategory ====>  ${err.message}`);
      throw new DeletingModelException();
    }
  }
}
