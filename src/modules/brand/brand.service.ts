import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Brand, BrandDocument} from "./schemas/brand.schema";
import {Model} from "mongoose";
import {GetBrandListsDto} from "./dto/brand.dto";

@Injectable()
export class BrandService {
  constructor(@InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>) {}

  async getBrandsList(body: GetBrandListsDto) {

  }

  async addBrand() {

  }

  async updateBrand() {

  }

  async deleteBrand(id: number) {

  }
}
