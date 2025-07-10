import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../modules/product/schemas/product.model';
import { Category, CategoryDocument } from '../../modules/category/schemas/category.schema';
import { Brand, BrandDocument } from '../../modules/brand/schemas/brand.schema';
import { ErrorHandlingService } from './error-handling.service';

// DTOs for standardized return types
export interface ProductSummary {
  productId: string;
  slugUz: string;
  slugRu: string;
  slugEn: string;
  name?: {
    uz: string;
    ru: string;
    en: string;
  };
}

export interface CategorySummary {
  categoryId: string;
  slugUz: string;
  slugRu: string;
  slugEn: string;
  hierarchy?: any[];
  hierarchyPath?: string;
}

export interface BrandSummary {
  brandId: string;
  slug: string;
  nameUz?: string;
  nameRu?: string;
  nameEn?: string;
}

@Injectable()
export class EntityValidationService {
  constructor(
    @InjectModel(Product.name) 
    private readonly productModel: Model<ProductDocument>,
    
    @InjectModel(Category.name) 
    private readonly categoryModel: Model<CategoryDocument>,
    
    @InjectModel(Brand.name) 
    private readonly brandModel: Model<BrandDocument>,
    
    private readonly errorHandler: ErrorHandlingService,
  ) {}

  /**
   * Validate and get product with standardized return format
   */
  async validateAndGetProduct(productId: string, includeDetails = false): Promise<ProductSummary> {
    this.errorHandler.validateObjectId(productId, 'Product');
    
    const product = await this.productModel.findById(productId).lean();
    if (!product) {
      this.errorHandler.handleNotFound('Product', productId);
    }
    
    const summary: ProductSummary = {
      productId: product._id.toString(),
      slugUz: product.slugUz,
      slugRu: product.slugRu,
      slugEn: product.slugEn,
    };

    if (includeDetails) {
      summary.name = {
        uz: product.nameUz,
        ru: product.nameRu,
        en: product.nameEn,
      };
    }

    return summary;
  }

  /**
   * Validate and get category with hierarchy information
   */
  async validateAndGetCategory(categoryId: string): Promise<CategorySummary> {
    this.errorHandler.validateObjectId(categoryId, 'Category');
    
    const category = await this.categoryModel.findById(categoryId).lean();
    if (!category) {
      this.errorHandler.handleNotFound('Category', categoryId);
    }
    
    return {
      categoryId: category._id.toString(),
      slugUz: category.slugUz,
      slugRu: category.slugRu,
      slugEn: category.slugEn,
      hierarchy: category.hierarchy || [],
      hierarchyPath: category.hierarchyPath || category._id.toString(),
    };
  }

  /**
   * Validate and get brand information
   */
  async validateAndGetBrand(brandId: string): Promise<BrandSummary> {
    this.errorHandler.validateObjectId(brandId, 'Brand');
    
    const brand = await this.brandModel.findById(brandId).lean();
    if (!brand) {
      this.errorHandler.handleNotFound('Brand', brandId);
    }
    
    return {
      brandId: brand._id.toString(),
      slug: brand.slug,
      nameUz: brand.nameUz,
      nameRu: brand.nameRu,
      nameEn: brand.nameEn,
    };
  }

  /**
   * Validate multiple products at once
   */
  async validateAndGetProducts(productIds: string[]): Promise<ProductSummary[]> {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      this.errorHandler.handleValidationError('Product IDs array cannot be empty');
    }

    // Validate all IDs first
    productIds.forEach(id => this.errorHandler.validateObjectId(id, 'Product'));

    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .lean();

    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p._id.toString());
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      this.errorHandler.handleNotFound('Products', missingIds.join(', '));
    }

    return products.map(product => ({
      productId: product._id.toString(),
      slugUz: product.slugUz,
      slugRu: product.slugRu,
      slugEn: product.slugEn,
    }));
  }

  /**
   * Validate multiple brands at once
   */
  async validateAndGetBrands(brandIds: string[]): Promise<BrandSummary[]> {
    if (!Array.isArray(brandIds) || brandIds.length === 0) {
      this.errorHandler.handleValidationError('Brand IDs array cannot be empty');
    }

    // Validate all IDs first
    brandIds.forEach(id => this.errorHandler.validateObjectId(id, 'Brand'));

    const brands = await this.brandModel
      .find({ _id: { $in: brandIds } })
      .lean();

    if (brands.length !== brandIds.length) {
      this.errorHandler.handleNotFound('One or more brands', brandIds.join(', '));
    }

    return brands.map(brand => ({
      brandId: brand._id.toString(),
      slug: brand.slug,
      nameUz: brand.nameUz,
      nameRu: brand.nameRu,
      nameEn: brand.nameEn,
    }));
  }

  /**
   * Validate entity existence by slug
   */
  async validateProductBySlug(slug: string, language: string): Promise<ProductSummary> {
    this.errorHandler.validateRequiredField(slug, 'Product slug');
    this.errorHandler.validateLanguage(language);

    const slugField = `slug${language}`;
    const product = await this.productModel.findOne({ [slugField]: slug }).lean();
    
    if (!product) {
      this.errorHandler.handleNotFound('Product', `slug: ${slug}`);
    }

    return {
      productId: product._id.toString(),
      slugUz: product.slugUz,
      slugRu: product.slugRu,
      slugEn: product.slugEn,
    };
  }

  /**
   * Validate category by slug
   */
  async validateCategoryBySlug(slug: string, language: string): Promise<CategorySummary> {
    this.errorHandler.validateRequiredField(slug, 'Category slug');
    this.errorHandler.validateLanguage(language);

    const slugField = `slug${language}`;
    const category = await this.categoryModel.findOne({ [slugField]: slug }).lean();
    
    if (!category) {
      this.errorHandler.handleNotFound('Category', `slug: ${slug}`);
    }

    return {
      categoryId: category._id.toString(),
      slugUz: category.slugUz,
      slugRu: category.slugRu,
      slugEn: category.slugEn,
      hierarchy: category.hierarchy || [],
      hierarchyPath: category.hierarchyPath || category._id.toString(),
    };
  }

  /**
   * Check if entity exists without throwing errors
   */
  async productExists(productId: string): Promise<boolean> {
    try {
      this.errorHandler.validateObjectId(productId, 'Product');
      const count = await this.productModel.countDocuments({ _id: productId });
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if category exists without throwing errors
   */
  async categoryExists(categoryId: string): Promise<boolean> {
    try {
      this.errorHandler.validateObjectId(categoryId, 'Category');
      const count = await this.categoryModel.countDocuments({ _id: categoryId });
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if brand exists without throwing errors
   */
  async brandExists(brandId: string): Promise<boolean> {
    try {
      this.errorHandler.validateObjectId(brandId, 'Brand');
      const count = await this.brandModel.countDocuments({ _id: brandId });
      return count > 0;
    } catch {
      return false;
    }
  }
}