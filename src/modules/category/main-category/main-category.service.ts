import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";

import {
  AddingModelException,
  DeletingModelException,
  UpdatingModelException
} from "../../../shared/errors/model/model-based.exceptions";

import {MainCategory, MainCategoryDocument} from "../schemas/main-category.schema";
import {IMainCategory} from "../interface/main-category";
import {CreateMainCategoryDto, GetMainCategoryDto, UpdateMainCategoryDto} from "../dto/main-category.dto";
import {universalSearchSchema} from "../../../shared/helpers/search";
import {generateUniqueSlug} from "../../../shared/helpers/generate-slugs";

@Injectable()
export class MainCategoryService {
  constructor(
      @InjectModel(MainCategory.name)
      private readonly mainCategoryModel: Model<MainCategoryDocument>) {
  }

  async getAllMainCategory(body: GetMainCategoryDto) {
    const payload = {
      page: body?.page ? body.page : 1,
      limit: body?.limit ? body.limit : 20,
      select: body?.select ? body.select.split(",") : null,
      search: body?.search || null,
    }
    const skip = (payload.page - 1) * payload.limit;
    const filter = await universalSearchSchema(payload.search, ['nameUz', 'nameRu', 'nameEn']);
    const getMatchingMainCategories = await this.mainCategoryModel
        .find(filter)
        .skip(skip)
        .limit(payload.limit)
        .select(payload.select ? payload.select : "-__v")
        .lean();
    const count = await this.mainCategoryModel.countDocuments();
    const pagination = {
      total: count,
      limit: payload.limit,
      page: payload.page,
      pages: Math.ceil(count / payload.limit),
    }
    return {
      data: getMatchingMainCategories,
      pagination,
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
      await this.mainCategoryModel.deleteOne({_id});
    } catch (err) {
      console.log(`deleting mainCategory ====>  ${err.message}`);
      throw new DeletingModelException();
    }
  }
}
