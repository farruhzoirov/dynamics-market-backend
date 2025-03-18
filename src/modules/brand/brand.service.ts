import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Brand, BrandDocument} from './schemas/brand.schema';
import {Model} from 'mongoose';
import {AddBrandDto, GetBrandListsDto, UpdateBrandDto} from './dto/brand.dto';
import {getFilteredResultsWithTotal} from '../../common/helpers/universal-query-builder';
import {generateUniqueSlug} from '../../common/helpers/generate-slug';
import {
  AddingModelException,
  CantDeleteModelException,
  ModelDataNotFoundByIdException,
} from '../../common/errors/model/model-based.exceptions';
import {Product, ProductDocument} from '../product/schemas/product.model';

@Injectable()
export class BrandService {
  constructor(
      @InjectModel(Brand.name)
      private readonly brandModel: Model<BrandDocument>,
      @InjectModel(Product.name)
      private readonly productModel: Model<ProductDocument>,
  ) {
  }

  async getBrandsList(
      body: GetBrandListsDto,
  ): Promise<{ data: any; total: number }> {
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

  async updateBrand(updateBody: UpdateBrandDto): Promise<void> {
    const languages = ['Uz', 'Ru', 'En'];
    languages.forEach((lang) => {
      const nameKey = `name${lang}`;
      const slugKey = `slug${lang}`;

      if (updateBody[nameKey]) {
        updateBody[slugKey] = generateUniqueSlug(updateBody[nameKey]);
      }
    });

    const findBrand = await this.brandModel.findById(updateBody._id);

    if (!findBrand) {
      throw new ModelDataNotFoundByIdException('Brand not found');
    }

    await this.brandModel.findByIdAndUpdate(updateBody._id, {
      $set: {
        ...updateBody,
      },
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
    await this.brandModel.updateOne({_id}, {isDeleted: true});
  }
}
