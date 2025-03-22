import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './schema/banner.schema';
import {
  AddBannerDto,
  GetBannersListDto,
  UpdateBannerDto,
} from './dto/banner.dto';
import { Product, ProductDocument } from '../product/schemas/product.model';
import {
  Category,
  CategoryDocument,
} from '../category/schemas/category.schema';
import { Brand, BrandDocument } from '../brand/schemas/brand.schema';
import { CategoryService } from '../category/category.service';
import { ModelDataNotFoundByIdException } from 'src/common/errors/model/model-based.exceptions';
import { getFilteredResultsWithTotal } from 'src/common/helpers/universal-query-builder';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    private readonly categoryService: CategoryService,
  ) {}

  async getBannersList(body: GetBannersListDto) {
    const [data, total] = await getFilteredResultsWithTotal(
      body,
      this.bannerModel,
      ['titleUz', 'titleRu', 'titleEn'],
    );

    return {
      data,
      total,
    };
  }

  async addBanner(body: AddBannerDto): Promise<void> {
    const customBody: Partial<{
      product: {};
      hierarchy: any[];
      brandSlugs: any[];
    }> = {
      brandSlugs: [],
    };

    if (body.productId) {
      const findProduct = await this.productModel
        .findById(body.productId)
        .lean();

      if (!findProduct) {
        throw new BadRequestException('Product not found');
      }

      customBody.product = {
        slugUz: findProduct.slugUz,
        slugRu: findProduct.slugRu,
        slugEn: findProduct.slugEn,
      };
    }

    if (body.categoryId) {
      const findCategory = await this.categoryModel
        .findById(body.categoryId)
        .lean();

      if (!findCategory) {
        throw new BadRequestException('Category not found');
      }
      const { hierarchyPath, hierarchy } =
        await this.categoryService.buildCategoryHierarchy(body.categoryId);
      customBody.hierarchy = hierarchy;
    }

    if (body.brandIds?.length) {
      const findBrands = await this.brandModel
        .find({ _id: { $in: body.brandIds } })
        .lean();

      if (!findBrands.length) {
        throw new BadRequestException('One of brands not found');
      }

      for (const brand of findBrands) {
        customBody.brandSlugs.push({
          slugUz: brand.slugUz,
          slugRu: brand.slugRu,
          slugEn: brand.slugEn,
        });
      }
    }

    await this.bannerModel.create({
      ...body,
      ...customBody,
    });
  }

  async updateBanner(updateBody: UpdateBannerDto) {
    const customBody: Partial<{
      product: {};
      hierarchy: any[];
      brandSlugs: any[];
    }> = {
      brandSlugs: [],
    };

    const findBanner = await this.bannerModel.findById(updateBody._id).lean();

    if (!findBanner) {
      throw new ModelDataNotFoundByIdException(
        "Couldn't update. Banner not found",
      );
    }

    if (updateBody.productId) {
      const findProduct = await this.productModel
        .findById(updateBody.productId)
        .lean();

      if (!findProduct) {
        throw new BadRequestException('Product not found');
      }

      customBody.product = {
        slugUz: findProduct.slugUz,
        slugRu: findProduct.slugRu,
        slugEn: findProduct.slugEn,
      };
    }

    if (updateBody.categoryId) {
      const findCategory = await this.categoryModel
        .findById(updateBody.categoryId)
        .lean();

      if (!findCategory) {
        throw new BadRequestException('Category not found');
      }
      const { hierarchyPath, hierarchy } =
        await this.categoryService.buildCategoryHierarchy(
          updateBody.categoryId,
        );
      customBody.hierarchy = hierarchy;
    }

    if (updateBody.brandIds?.length) {
      const findBrands = await this.brandModel
        .find({ _id: { $in: updateBody.brandIds } })
        .lean();

      if (!findBrands.length) {
        throw new BadRequestException('One of brands not found');
      }

      for (const brand of findBrands) {
        customBody.brandSlugs.push({
          slugUz: brand.slugUz,
          slugRu: brand.slugRu,
          slugEn: brand.slugEn,
        });
      }
    }

    await this.bannerModel.findByIdAndUpdate(updateBody._id, {
      $set: {
        ...updateBody,
        ...customBody,
      },
    });
  }

  async deleteBanner(_id: string) {
    const findBanner = await this.bannerModel.findById(_id).lean();
    if (!findBanner) {
      throw new ModelDataNotFoundByIdException('Banner not found');
    }
    await this.bannerModel.updateOne({ _id }, { isDeleted: true });
  }
}
