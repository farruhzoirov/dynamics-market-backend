import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Brand, BrandDocument} from "./schemas/brand.schema";
import {Model} from "mongoose";
import {GetBrandListsDto} from "./dto/brand.dto";
import {universalQueryBuilder} from "../../common/helpers/universal-query-builder";

@Injectable()
export class BrandService {
  constructor(@InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>) {
  }

  async getBrandsList(body: GetBrandListsDto) {
    const allBrandsList = await universalQueryBuilder(body, this.brandModel, ['nameUz', 'nameRu', 'nameEn']);
    const total = await this.brandModel.countDocuments();
    return {
      data: allBrandsList,
      total
    }
  }

  async addBrand() {

  }

  async updateBrand() {

  }

  async deleteBrand(id: string) {

  }
}
