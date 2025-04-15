import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';
import { Model } from 'mongoose';
import { AddBrandDto, GetBrandListsDto, UpdateBrandDto } from './dto/brand.dto';
import { getFilteredResultsWithTotal } from '../../common/helpers/universal-query-builder';
import { generateUniqueSlug } from '../../common/helpers/generate-slug';
import {
  AddingModelException,
  CantDeleteModelException,
  ModelDataNotFoundByIdException,
} from '../../common/errors/model/model-based.exceptions';
import { Product, ProductDocument } from '../product/schemas/product.model';
import { buildBrandPipeline } from '../../common/helpers/pipelines/brand-pipeline';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getBrandsList(
    body: GetBrandListsDto,
    lang: string | null,
  ): Promise<{ data: any; total: number }> {
    if (lang) {
      const pipeline = await buildBrandPipeline(lang);
      const [data, total] = await Promise.all([
        await this.brandModel.aggregate(pipeline).exec(),
        await this.brandModel.countDocuments({ isDeleted: false }),
      ]);

      return {
        data,
        total,
      };
    }

    const [data, total] = await getFilteredResultsWithTotal(
      body,
      this.brandModel,
      ['nameUz', 'nameRu', 'nameEn'],
    );
    return {
      data,
      total,
    };
  }

  async addBrand(body: AddBrandDto): Promise<void> {
    try {
      const { nameUz, nameRu, nameEn } = body;

      const slugUz = generateUniqueSlug(nameUz);
      const slugRu = generateUniqueSlug(nameRu);
      const slugEn = generateUniqueSlug(nameEn);

      const createBody = {
        ...body,
        slugUz,
        slugRu,
        slugEn,
      };

      await this.brandModel.create(createBody);
    } catch (err) {
      console.log(`adding brand ====>  ${err.message}`);
      throw new AddingModelException();
    }
  }

  async updateBrand(updateBody: UpdateBrandDto): Promise<void> {
    const findBrand = await this.brandModel.findById(updateBody._id);

    if (!findBrand) {
      throw new ModelDataNotFoundByIdException('Brand not found');
    }

    const { nameUz, nameRu, nameEn } = updateBody;
    const slugUz = nameUz ? generateUniqueSlug(nameUz) : null;
    const slugRu = nameRu ? generateUniqueSlug(nameRu) : null;
    const slugEn = nameEn ? generateUniqueSlug(nameEn) : null;

    const forUpdateBody = {
      ...updateBody,
      ...(slugUz && { slugUz }),
      ...(slugRu && { slugRu }),
      ...(slugEn && { slugEn }),
    };

    await this.brandModel.findByIdAndUpdate(updateBody._id, {
      $set: forUpdateBody,
    });
  }

  async deleteBrand(_id: string): Promise<void> {
    const checkBrand = await this.brandModel.findById(_id);
    if (!checkBrand) {
      throw new ModelDataNotFoundByIdException('Brand not found');
    }

    const hasProducts = await this.productModel.exists({
      brandId: _id,
      isDeleted: false,
    });

    if (hasProducts) {
      throw new CantDeleteModelException(
        'Cannot delete category with linked products',
      );
    }
    await this.brandModel.updateOne({ _id }, { isDeleted: true });
  }
}
