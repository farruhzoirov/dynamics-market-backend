import { Injectable } from '@nestjs/common';
import {GetMidCategoryDto} from "../dto/min-category.dto";
import {universalSearchSchema} from "../../../shared/helpers/search";
import {IMidCategory, ISubCategory} from "../interface/categories";
import {generateUniqueSlug} from "../../../shared/helpers/generate-slugs";
import {
  AddingModelException,
  DeletingModelException,
  UpdatingModelException
} from "../../../shared/errors/model/model-based.exceptions";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {SubCategory, SubCategoryDocument} from "../schemas/sub-category.schema";

@Injectable()
export class SubCategoryService {
  constructor(
      @InjectModel(SubCategory.name)
      private readonly subCategoryModel: Model<SubCategoryDocument>) {
  }


  async getSubCategoriesList(body: GetMidCategoryDto) {
    const payload = {
      page: body?.page ? body.page : 1,
      limit: body?.limit ? body.limit : null,
      select: body?.select ? body.select.split(",") : null,
      search: body?.search || null,
    }
    const skip = (payload.page - 1) * payload.limit;
    const filter = await universalSearchSchema(payload.search, ['nameUz', 'nameRu', 'nameEn']);
    const getMatchingSubCategories = await this.subCategoryModel
        .find(filter)
        .skip(skip)
        .limit(payload.limit)
        .select(payload.select ? payload.select : "-__v")
        .lean();
    const total = await this.subCategoryModel.countDocuments();
    return {
      data: getMatchingSubCategories,
      total,
    }
  }

  async addSubCategory(body: ISubCategory) {
    try {
      const {nameUz, nameRu, nameEn} = body;
      body.slugUz = generateUniqueSlug(nameUz);
      body.slugRu = generateUniqueSlug(nameRu);
      body.slugEn = generateUniqueSlug(nameEn);

      if (body.parentId) {
        body.midCategory = body.parentId;
      }

      await this.subCategoryModel.create(body);
    } catch (err) {
      console.log(`adding midCategory ====>  ${err.message}`);
      throw new AddingModelException();
    }
  }

  async updateSubCategory(updateBody: ISubCategory) {
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
        updateBody.midCategory = updateBody.parentId;
      }

      await this.subCategoryModel.findByIdAndUpdate(updateBody._id, {
        $set: {
          ...updateBody,
        }
      })
    } catch (err) {
      console.log(`updating midCategory ====>  ${err.message}`);
      throw new UpdatingModelException();
    }
  }

  async deleteSubCategory(_id: string) {
    try {
      await this.subCategoryModel.deleteOne({_id});
    } catch (err) {
      console.log(`deleting midCategory ====>  ${err.message}`);
      throw new DeletingModelException();
    }
  }
}
