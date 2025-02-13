import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import slugify from "slugify";

import {
  AddingModelException,
  DeletingModelException,
  UpdatingModelException
} from "../../../shared/errors/model/model-based.exceptions";

import {MainCategory, MainCategoryDocument} from "../schemas/main-category.schema";
import {IMainCategory} from "../interface/main-category";
import {GetMainCategoryDto} from "../dto/main-category.dto";
import {universalSearchSchema} from "../../../shared/helpers/search";
import {generateUniqueSlug} from "../../../shared/helpers/generate-slugs";

@Injectable()
export class MainCategoryService {
  constructor(
      @InjectModel(MainCategory.name)
      private readonly mainCategoryModel: Model<MainCategoryDocument>) {
  }

  async getAllMainCategory(query: GetMainCategoryDto) {
    const payload = {
      page: query?.page ? +query.page : 1,
      limit: query?.limit ? +query.limit : 20,
      select: query?.select ? query.select.split(",") : null,
      search: query?.search || null,
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

  async addMainCategory(body: IMainCategory) {
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

  async updateMainCategory(body: IMainCategory) {
    try {


      await this.mainCategoryModel.updateOne({
        $set: {
          ...body,
        }
      })
    } catch (err) {
      console.log(`updating mainCategory ====>  ${err.message}`);
      throw new UpdatingModelException();
    }
  }

  async deleteMainCategory(id: string) {
    try {
      await this.mainCategoryModel.deleteOne({_id: id});
    } catch (err) {
      console.log(`deleting mainCategory ====>  ${err.message}`);
      throw new DeletingModelException();
    }
  }
}
