import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
import { Product } from '../product/schemas/product.model';
import mongoose from 'mongoose';

interface IProduct extends Product {
  _id: mongoose.Types.ObjectId;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger();
  private readonly indexName = 'products';

  constructor(private readonly elasticsearchService: NestElasticsearchService) {
    this.initIndex();
  }

  private async initIndex() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.indexName,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.indexName,
          mappings: {
            properties: {
              nameUz: { type: 'text', analyzer: 'standard' },
              nameRu: { type: 'text', analyzer: 'standard' },
              nameEn: { type: 'text', analyzer: 'standard' },
              descriptionUz: { type: 'text', analyzer: 'standard' },
              descriptionRu: { type: 'text', analyzer: 'standard' },
              descriptionEn: { type: 'text', analyzer: 'standard' },
              slugUz: { type: 'keyword' },
              slugRu: { type: 'keyword' },
              slugEn: { type: 'keyword' },
              attributes: {
                type: 'nested',
                properties: {
                  nameUz: { type: 'text' },
                  nameRu: { type: 'text' },
                  nameEn: { type: 'text' },
                  valueUz: { type: 'text' },
                  valueRu: { type: 'text' },
                  valueEn: { type: 'text' },
                },
              },
              oldPrice: { type: 'float' },
              currentPrice: { type: 'float' },
              quantity: { type: 'integer' },
              categoryId: { type: 'keyword' },
              brandId: { type: 'keyword' },
              status: { type: 'integer' },
              isDeleted: { type: 'boolean' },
              keywords: { type: 'text' },
              hierarchyPath: { type: 'keyword' },
              views: { type: 'integer' },
              availability: { type: 'keyword' },
            },
          },
        });
        this.logger.log(`Created index: ${this.indexName}`);
      }
    } catch (error) {
      this.logger.error(`Error creating index: ${error.message}`);
    }
  }

  async indexProduct(product: IProduct) {
    try {
      await this.elasticsearchService.index({
        index: this.indexName,
        id: product._id.toString(),
        document: {
          nameUz: product.nameUz,
          nameRu: product.nameRu,
          nameEn: product.nameEn,
          descriptionUz: product.descriptionUz,
          descriptionRu: product.descriptionRu,
          descriptionEn: product.descriptionEn,
          slugUz: product.slugUz,
          slugRu: product.slugRu,
          slugEn: product.slugEn,
          attributes: product.attributes,
          oldPrice: product.oldPrice,
          currentPrice: product.currentPrice,
          quantity: product.quantity,
          categoryId: product.categoryId?.toString(),
          brandId: product.brandId?.toString(),
          status: product.status,
          isDeleted: product.isDeleted,
          keywords: product.keywords,
          hierarchyPath: product.hierarchyPath,
          views: product.views,
          availability: product.availability,
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`Error indexing product: ${error.message}`);
      return false;
    }
  }

  async updateIndexedProduct(product: IProduct) {
    try {
      await this.elasticsearchService.update({
        index: this.indexName,
        id: product._id.toString(),
        doc: {
          nameUz: product.nameUz,
          nameRu: product.nameRu,
          nameEn: product.nameEn,
          descriptionUz: product.descriptionUz,
          descriptionRu: product.descriptionRu,
          descriptionEn: product.descriptionEn,
          slugUz: product.slugUz,
          slugRu: product.slugRu,
          slugEn: product.slugEn,
          sku: product.sku,
          attributes: product.attributes,
          oldPrice: product.oldPrice,
          currentPrice: product.currentPrice,
          quantity: product.quantity,
          categoryId: product.categoryId?.toString(),
          brandId: product.brandId?.toString(),
          status: product.status,
          isDeleted: product.isDeleted,
          keywords: product.keywords,
          hierarchyPath: product.hierarchyPath,
          views: product.views,
          availability: product.availability,
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`Error updating indexed product: ${error.message}`);
      return false;
    }
  }

  async removeIndexedProduct(productId: string) {
    try {
      await this.elasticsearchService.delete({
        index: this.indexName,
        id: productId,
      });
      return true;
    } catch (error) {
      this.logger.error(`Error removing indexed product: ${error.message}`);
      return false;
    }
  }

  async search(
    query: string,
    lang: string = 'Uz',
    from: number = 0,
    size: number = 10,
  ) {
    try {
      const namePath = `name${lang}`;
      const descPath = `description${lang}`;

      const { hits } = await this.elasticsearchService.search({
        index: this.indexName,
        from,
        size,
        query: {
          bool: {
            must: [{ term: { isDeleted: false } }, { term: { status: 1 } }],
            should: [
              { match: { [namePath]: { query, boost: 3.0 } } },
              { match: { [descPath]: { query, boost: 1.0 } } },
              { match: { sku: { query, boost: 5.0 } } },
              { match: { keywords: { query, boost: 2.0 } } },
              {
                nested: {
                  path: 'attributes',
                  query: {
                    bool: {
                      should: [
                        { match: { [`attributes.value${lang}`]: query } },
                      ],
                    },
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
        highlight: {
          fields: {
            [namePath]: {},
            [descPath]: {},
            sku: {},
            keywords: {},
            [`attributes.value${lang}`]: {},
          },
        },
      });

      return {
        total: hits.total,
        hits: hits.hits.map((hit) => ({
          ...(hit._source as object),
          _id: hit._id,
          score: hit._score,
          highlight: hit.highlight,
        })),
      };
    } catch (error) {
      this.logger.error(`Error searching: ${error.message}`);
      return {
        total: { value: 0 },
        hits: [],
      };
    }
  }

  async bulkIndex(products: IProduct[]) {
    try {
      const operations = products.flatMap((product) => [
        { index: { _index: this.indexName, _id: product._id.toString() } },
        {
          nameUz: product.nameUz,
          nameRu: product.nameRu,
          nameEn: product.nameEn,
          descriptionUz: product.descriptionUz,
          descriptionRu: product.descriptionRu,
          descriptionEn: product.descriptionEn,
          slugUz: product.slugUz,
          slugRu: product.slugRu,
          slugEn: product.slugEn,
          sku: product.sku,
          attributes: product.attributes,
          oldPrice: product.oldPrice,
          currentPrice: product.currentPrice,
          quantity: product.quantity,
          categoryId: product.categoryId?.toString(),
          brandId: product.brandId?.toString(),
          status: product.status,
          isDeleted: product.isDeleted,
          keywords: product.keywords,
          hierarchyPath: product.hierarchyPath,
          views: product.views,
          availability: product.availability,
        },
      ]);

      const { errors } = await this.elasticsearchService.bulk({ operations });
      if (errors) {
        this.logger.error('Errors during bulk indexing');
      }
      return !errors;
    } catch (error) {
      this.logger.error(`Error bulk indexing: ${error.message}`);
      return false;
    }
  }
}
