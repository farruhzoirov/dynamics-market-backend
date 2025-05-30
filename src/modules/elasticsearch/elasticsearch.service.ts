import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
import { Product } from '../product/schemas/product.model';
import mongoose from 'mongoose';
import { SearchProductsDto } from '../product/dto/product.dto';
import { IElasticSearchPayload } from 'src/shared/interfaces/e-search-payload';

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
      await this.deleteIndex();
      await this.elasticsearchService.indices.create({
        index: this.indexName,
        body: {
          settings: {
            analysis: {
              tokenizer: {
                ngram_tokenizer: {
                  type: 'ngram',
                  min_gram: 3,
                  max_gram: 3,
                  token_chars: ['letter', 'digit'],
                },
              },
              analyzer: {
                ngram_analyzer: {
                  type: 'custom',
                  tokenizer: 'ngram_tokenizer',
                  filter: ['lowercase'],
                },
              },
            },
          },

          mappings: {
            properties: {
              nameUz: {
                type: 'text',
                analyzer: 'ngram_analyzer',
                search_analyzer: 'ngram_analyzer',
              },
              nameRu: {
                type: 'text',
                analyzer: 'ngram_analyzer',
                search_analyzer: 'ngram_analyzer',
              },
              nameEn: {
                type: 'text',
                analyzer: 'ngram_analyzer',
                search_analyzer: 'ngram_analyzer',
              },
              descriptionUz: {
                type: 'text',
                analyzer: 'ngram_analyzer',
                search_analyzer: 'ngram_analyzer',
              },
              descriptionRu: {
                type: 'text',
                analyzer: 'ngram_analyzer',
                search_analyzer: 'ngram_analyzer',
              },
              descriptionEn: {
                type: 'text',
                analyzer: 'ngram_analyzer',
                search_analyzer: 'ngram_analyzer',
              },
              sku: { type: 'keyword' },
              slugUz: { type: 'keyword' },
              slugRu: { type: 'keyword' },
              slugEn: { type: 'keyword' },
              status: { type: 'integer' },
              isDeleted: { type: 'boolean' },
              hierarchyPath: { type: 'keyword' },
              views: { type: 'integer' },
              availability: { type: 'keyword' },
              attributes: {
                type: 'nested',
                properties: {
                  nameUz: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'ngram_analyzer',
                  },
                  nameRu: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'ngram_analyzer',
                  },
                  nameEn: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'ngram_analyzer',
                  },
                  valueUz: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'ngram_analyzer',
                  },
                  valueRu: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'ngram_analyzer',
                  },
                  valueEn: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'ngram_analyzer',
                  },
                },
              },
              keywords: {
                type: 'text',
                analyzer: 'ngram_analyzer',
                search_analyzer: 'ngram_analyzer',
              },
            },
          },
        },
      });
      this.logger.log(`Indeks yaratildi: ${this.indexName}`);
    } catch (error) {
      this.logger.error(`Indeks yaratishda xatolik: ${error.message}`);
    }
  }
  // private async initIndex() {
  //   try {
  //     const indexExists = await this.elasticsearchService.indices.exists({
  //       index: this.indexName,
  //     });

  //     if (!indexExists) {
  //       await this.elasticsearchService.indices.create({
  //         index: this.indexName,
  //         mappings: {
  //           properties: {
  //             nameUz: { type: 'text', analyzer: 'standard' },
  //             nameRu: { type: 'text', analyzer: 'standard' },
  //             nameEn: { type: 'text', analyzer: 'standard' },
  //             descriptionUz: { type: 'text', analyzer: 'standard' },
  //             descriptionRu: { type: 'text', analyzer: 'standard' },
  //             descriptionEn: { type: 'text', analyzer: 'standard' },
  //             slugUz: { type: 'keyword' },
  //             slugRu: { type: 'keyword' },
  //             slugEn: { type: 'keyword' },
  //             attributes: {
  //               type: 'nested',
  //               properties: {
  //                 nameUz: { type: 'text' },
  //                 nameRu: { type: 'text' },
  //                 nameEn: { type: 'text' },
  //                 valueUz: { type: 'text' },
  //                 valueRu: { type: 'text' },
  //                 valueEn: { type: 'text' },
  //               },
  //             },
  //             oldPrice: { type: 'float' },
  //             currentPrice: { type: 'float' },
  //             quantity: { type: 'integer' },
  //             categoryId: { type: 'keyword' },
  //             brandId: { type: 'keyword' },
  //             status: { type: 'integer' },
  //             isDeleted: { type: 'boolean' },
  //             keywords: { type: 'text' },
  //             hierarchyPath: { type: 'keyword' },
  //             views: { type: 'integer' },
  //             availability: { type: 'keyword' },
  //           },
  //         },
  //       });
  //       this.logger.log(`Created index: ${this.indexName}`);
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error creating index: ${error}`);
  //   }
  // }

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
          sku: product.sku,
          status: product.status,
          isDeleted: product.isDeleted,
          availibility: product.availability,
          hierarchyPath: product.hierarchyPath,
          attributes: product.attributes,
          keywords: product.keywords,
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
          keywords: product.keywords,
          status: product.status,
          isDeleted: product.isDeleted,
          availibility: product.availability,
          hierarchyPath: product.hierarchyPath,
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`Error updating indexed product: ${error.message}`);
      return false;
    }
  }

  async deleteIndexedProduct(productId: string) {
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

  private async deleteIndex() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.indexName,
      });

      if (indexExists) {
        await this.elasticsearchService.indices.delete({
          index: this.indexName,
        });
        this.logger.log(`Indeks o'chirildi: ${this.indexName}`);
      }
    } catch (error) {
      this.logger.error(`Indeksni o'chirishda xatolik: ${error.message}`);
    }
  }

  async search(
    body: SearchProductsDto,
    lang: string = 'Uz',
    from: number = 0,
    size: number = 12,
  ) {
    try {
      const query = body.search?.trim();
      console.log('Search query:', query);

      // Asosiy filterlar
      const mustQueries: any[] = [
        { term: { isDeleted: false } },
        { term: { status: 1 } },
      ];

      // Kategoriya bo'yicha filter
      if (body.categoryId) {
        mustQueries.push({
          term: { hierarchyPath: body.categoryId },
        });
      }

      // Elasticsearch query
      const { hits } = await this.elasticsearchService.search({
        index: this.indexName,
        from,
        size,
        query: {
          bool: {
            must: mustQueries,
            should: query
              ? [
                  { match: { nameUz: { query, boost: 3.0 } } },
                  { match: { nameRu: { query, boost: 3.0 } } },
                  { match: { nameEn: { query, boost: 3.0 } } },
                  { match: { descriptionUz: { query, boost: 2.0 } } },
                  { match: { descriptionRu: { query, boost: 2.0 } } },
                  { match: { descriptionEn: { query, boost: 2.0 } } },
                  { match: { keywords: { query, boost: 2.0 } } },
                  { match: { availibility: { query, boost: 2.0 } } },

                  {
                    nested: {
                      path: 'attributes',
                      query: {
                        bool: {
                          should: [
                            { match: { 'attributes.valueUz': query } },
                            { match: { 'attributes.valueRu': query } },
                            { match: { 'attributes.valueEn': query } },
                          ],
                        },
                      },
                    },
                  },
                ]
              : [],
            minimum_should_match: query ? 1 : 0,
          },
        },
      });

      return {
        total: hits.total,
        hits: hits.hits.map((hit) => ({
          _id: hit._id,
        })),
      };
    } catch (error) {
      this.logger.error(`Error during search: ${error?.message || error}`);
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
          status: product.status,
          isDeleted: product.isDeleted,
          hierarchyPath: product.hierarchyPath,
          availability: product.availability,
          attributes: product.attributes,
          keywords: product.keywords,
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
