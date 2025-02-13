import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import slugify from "slugify";
import {v4 as uuid4} from 'uuid';
import {
  AddingModelException,
  DeletingModelException,
  UpdatingModelException
} from "../../../shared/errors/model/model-based.exceptions";
import {MainCategory, MainCategoryDocument} from "../schemas/main-category.schema";
import {IMainCategory} from "../interface/main-category";
import {GetMainCategoryDto} from "../dto/main-category.dto";

@Injectable()
export class MainCategoryService {
  constructor(
      @InjectModel(MainCategory.name) private readonly mainCategoryModel: Model<MainCategoryDocument>) {
  }

  async getAllMainCategory(query: GetMainCategoryDto) {
    const payload = {
      page: query?.page || 1,
      limit: query?.limit || 20,
      select: query?.select || null,
      search: query?.search || null,
    }

    const skip = (payload.page - 1) * payload.limit;
    await this.mainCategoryModel.find().select(payload.select).skip(skip).limit(payload.limit).select(payload.select).lean();
  }

  async addMainCategory(body: IMainCategory) {
    try {
      const {nameUz, nameRu, nameEn} = body;
      body.slugUz = `${slugify(nameUz)}-${uuid4().slice(0, 8)}`;
      body.slugRu = `${slugify(nameRu)}-${uuid4().slice(0, 8)}`;
      body.slugEn = `${slugify(nameEn)}-${uuid4().slice(0, 8)}`;
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
