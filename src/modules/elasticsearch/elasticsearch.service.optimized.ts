import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
import { Product } from '../product/schemas/product.model';
import mongoose from 'mongoose';
import { SearchProductsDto } from '../product/dto/product.dto';

interface IProduct extends Product {
  _id: mongoose.Types.ObjectId;
}

@Injectable()
export class SearchServiceOptimized implements OnModuleInit {
  private readonly logger = new Logger('SearchServiceOptimized');
  private readonly indexName = 'products_v2';
  private indexingQueue: IProduct[] = [];
  private isProcessingQueue = false;

  constructor(private readonly elasticsearchService: NestElasticsearchService) {}

  async onModuleInit() {
    await this.initOptimizedIndex();
    this.startBulkIndexingProcessor();
  }

  private async initOptimizedIndex() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.indexName,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.indexName,
          settings: {
            number_of_shards: 3,
            number_of_replicas: 1,
            refresh_interval: '30s', // Reduce refresh frequency for better performance
            max_result_window: 50000,
            max_rescore_window: 50000,
            analysis: {
              tokenizer: {
                ngram_tokenizer: {
                  type: 'ngram',
                  min_gram: 2,
                  max_gram: 3,
                  token_chars: ['letter', 'digit'],
                },
                edge_ngram_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 10,
                  token_chars: ['letter', 'digit'],
                },
              },
              analyzer: {
                ngram_analyzer: {
                  type: 'custom',
                  tokenizer: 'ngram_tokenizer',
                  filter: ['lowercase', 'trim'],
                },
                edge_ngram_analyzer: {
                  type: 'custom',
                  tokenizer: 'edge_ngram_tokenizer',
                  filter: ['lowercase', 'trim'],
                },
                search_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'trim'],
                },
              },
            },
          },
          mappings: {
            properties: {
              nameUz: {
                type: 'text',
                analyzer: 'edge_ngram_analyzer',
                search_analyzer: 'search_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  ngram: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                  },
                },
              },
              nameRu: {
                type: 'text',
                analyzer: 'edge_ngram_analyzer',
                search_analyzer: 'search_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  ngram: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                  },
                },
              },
              nameEn: {
                type: 'text',
                analyzer: 'edge_ngram_analyzer',
                search_analyzer: 'search_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  ngram: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                  },
                },
              },
              descriptionUz: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  ngram: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                  },
                },
              },
              descriptionRu: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  ngram: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                  },
                },
              },
              descriptionEn: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  ngram: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                  },
                },
              },
              sku: { type: 'keyword', boost: 2.0 },
              slugUz: { type: 'keyword' },
              slugRu: { type: 'keyword' },
              slugEn: { type: 'keyword' },
              status: { type: 'integer', index: true },
              isDeleted: { type: 'boolean', index: true },
              hierarchyPath: { type: 'keyword', index: true },
              views: { type: 'integer', index: true },
              availability: { type: 'keyword', index: true },
              currentPrice: { type: 'double', index: true },
              oldPrice: { type: 'double', index: true },
              categoryId: { type: 'keyword', index: true },
              brandId: { type: 'keyword', index: true },
              inStock: { type: 'boolean', index: true },
              createdAt: { type: 'date', index: true },
              updatedAt: { type: 'date', index: true },
              attributes: {
                type: 'nested',
                properties: {
                  nameUz: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                  },
                  nameRu: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                  },
                  nameEn: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                  },
                  valueUz: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                    fields: { keyword: { type: 'keyword' } },
                  },
                  valueRu: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                    fields: { keyword: { type: 'keyword' } },
                  },
                  valueEn: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'search_analyzer',
                    fields: { keyword: { type: 'keyword' } },
                  },
                },
              },
              keywords: {
                type: 'text',
                analyzer: 'ngram_analyzer',
                search_analyzer: 'search_analyzer',
                fields: { keyword: { type: 'keyword' } },
              },
            },
          },
        });
        this.logger.log(`Optimized index created: ${this.indexName}`);
      }
    } catch (error) {
      this.logger.error(`Error creating optimized index: ${error.message}`);
    }
  }

  async searchOptimized(
    body: SearchProductsDto,
    lang: string = 'Uz',
    from: number = 0,
    size: number = 12,
  ) {
    try {
      const query = body.search?.trim();
      
      // Base filters for all queries
      const mustQueries: any[] = [
        { term: { isDeleted: false } },
        { term: { status: 1 } },
      ];

      // Category filter
      if (body.categoryId) {
        mustQueries.push({
          term: { hierarchyPath: body.categoryId },
        });
      }

      // Price range filter
      if (body.minPrice || body.maxPrice) {
        const priceRange: any = {};
        if (body.minPrice) priceRange.gte = body.minPrice;
        if (body.maxPrice) priceRange.lte = body.maxPrice;
        mustQueries.push({
          range: { currentPrice: priceRange },
        });
      }

      // Brand filter
      if (body.brandIds?.length) {
        mustQueries.push({
          terms: { brandId: body.brandIds },
        });
      }

      let searchQuery: any = {
        bool: {
          must: mustQueries,
        },
      };

      // Add search-specific queries
      if (query) {
        searchQuery.bool.should = [
          // Exact matches with highest boost
          { match_phrase: { [`name${lang}`]: { query, boost: 5.0 } } },
          { match_phrase: { sku: { query, boost: 4.0 } } },
          
          // Fuzzy matches for names
          { 
            match: { 
              [`name${lang}`]: { 
                query, 
                boost: 3.0,
                fuzziness: 'AUTO',
                operator: 'and'
              } 
            } 
          },
          { 
            match: { 
              [`name${lang}.ngram`]: { 
                query, 
                boost: 2.5 
              } 
            } 
          },
          
          // Description matches
          { 
            match: { 
              [`description${lang}`]: { 
                query, 
                boost: 1.5 
              } 
            } 
          },
          { 
            match: { 
              [`description${lang}.ngram`]: { 
                query, 
                boost: 1.0 
              } 
            } 
          },
          
          // Keywords and availability
          { match: { keywords: { query, boost: 2.0 } } },
          { match: { availability: { query, boost: 1.5 } } },
          
          // Nested attributes search
          {
            nested: {
              path: 'attributes',
              query: {
                bool: {
                  should: [
                    { match: { [`attributes.value${lang}`]: { query, boost: 2.0 } } },
                    { match: { [`attributes.name${lang}`]: { query, boost: 1.5 } } },
                  ],
                },
              },
              boost: 1.5,
            },
          },
        ];
        
        searchQuery.bool.minimum_should_match = 1;
      }

      // Add sorting
      const sort: any[] = [];
      
      if (query) {
        sort.push({ _score: { order: 'desc' } });
      }
      
      sort.push(
        { views: { order: 'desc' } },
        { createdAt: { order: 'desc' } }
      );

      const searchParams = {
        index: this.indexName,
        from,
        size,
        query: searchQuery,
        sort,
        track_scores: true,
        // Add performance optimizations
        preference: '_local', // Route to local shards when possible
        timeout: '30s',
      };

      const { hits } = await this.elasticsearchService.search(searchParams);

      return {
        total: hits.total,
        hits: hits.hits.map((hit) => ({
          _id: hit._id,
          _score: hit._score,
        })),
      };
    } catch (error) {
      this.logger.error(`Optimized search error: ${error?.message || error}`);
      return {
        total: { value: 0 },
        hits: [],
      };
    }
  }

  async bulkIndexOptimized(products: IProduct[], batchSize: number = 1000) {
    try {
      // Process in chunks for better memory management
      const chunks = this.chunkArray(products, batchSize);
      let successCount = 0;

      for (const chunk of chunks) {
        const operations = chunk.flatMap((product) => [
          { index: { _index: this.indexName, _id: product._id.toString() } },
          this.transformProductForIndex(product),
        ]);

        const { errors, items } = await this.elasticsearchService.bulk({
          operations,
          refresh: false, // Don't refresh immediately for better performance
        });

        if (!errors) {
          successCount += chunk.length;
        } else {
          this.logger.error(`Bulk indexing errors for chunk: ${JSON.stringify(items?.filter(item => item.index?.error))}`);
        }
      }

      // Refresh index once after all operations
      await this.elasticsearchService.indices.refresh({ index: this.indexName });
      
      this.logger.log(`Successfully indexed ${successCount} products`);
      return successCount;
    } catch (error) {
      this.logger.error(`Bulk indexing error: ${error.message}`);
      return 0;
    }
  }

  private transformProductForIndex(product: IProduct) {
    return {
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
      currentPrice: product.currentPrice,
      oldPrice: product.oldPrice,
      categoryId: product.categoryId?.toString(),
      brandId: product.brandId?.toString(),
      inStock: product.inStock,
      views: product.views || 0,
      attributes: product.attributes || [],
      keywords: product.keywords || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private startBulkIndexingProcessor() {
    // Process indexing queue every 10 seconds
    setInterval(() => {
      if (this.indexingQueue.length > 0 && !this.isProcessingQueue) {
        this.processBulkIndexingQueue();
      }
    }, 10000);
  }

  private async processBulkIndexingQueue() {
    if (this.isProcessingQueue || this.indexingQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const queueCopy = [...this.indexingQueue];
    this.indexingQueue = [];

    try {
      await this.bulkIndexOptimized(queueCopy, 500);
    } catch (error) {
      this.logger.error('Error processing bulk indexing queue:', error);
      // Re-add failed items back to queue
      this.indexingQueue.unshift(...queueCopy);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  async queueProductForIndexing(product: IProduct) {
    this.indexingQueue.push(product);
  }

  async deleteIndexedProductOptimized(productId: string) {
    try {
      await this.elasticsearchService.delete({
        index: this.indexName,
        id: productId,
        refresh: false, // Don't refresh immediately
      });
      return true;
    } catch (error) {
      this.logger.error(`Error deleting indexed product: ${error.message}`);
      return false;
    }
  }
}