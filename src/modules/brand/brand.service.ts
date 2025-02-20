import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Brand, BrandDocument} from "./schemas/brand.schema";
import {Model} from "mongoose";
import {AddBrandDto, GetBrandListsDto, UpdateBrandDto} from "./dto/brand.dto";
import {getFilteredResultsWithTotal} from "../../common/helpers/universal-query-builder";
import {generateUniqueSlug} from "../../common/helpers/generate-slugs";
import {AddingModelException, UpdatingModelException} from "../../common/errors/model/model-based.exceptions";

@Injectable()
export class BrandService {
  constructor(@InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>) {
  }

  async getBrandsList(body: GetBrandListsDto): Promise<{data: any, total: number}> {
    const getMatchesBrandsList = await getFilteredResultsWithTotal(body, this.brandModel, ['nameUz', 'nameRu', 'nameEn']);
    const total = await this.brandModel.countDocuments();
    return {
      data: getMatchesBrandsList,
      total
    }
  }

  async addBrand(body: AddBrandDto): Promise<void> {
    try {
      const {nameUz, nameRu, nameEn} = body;
      body.slugUz = generateUniqueSlug(nameUz);
      body.slugRu = generateUniqueSlug(nameRu);
      body.slugEn = generateUniqueSlug(nameEn);
      await this.brandModel.create(body);
    } catch (err) {
      console.log(`adding brand ====>  ${err.message}`);
      throw new AddingModelException();
    }
  }

  async updateBrand(updateBody: UpdateBrandDto) {
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
      //
      // await this.brandModel.findByIdAndUpdate(updateBody._id, {
      //   $set: {
      //     ...updateBody,
      //   }
      // })
    } catch (err) {
      console.log(`updating brand ====>  ${err.message}`);
      throw new UpdatingModelException();
    }
  }

  async deleteBrand(_id: string) {
    await this.brandModel.deleteOne({_id});
  }
}
