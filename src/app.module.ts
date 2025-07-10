import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthMiddleware } from './shared/middleware/auth.middleware';
import { PerformanceMiddleware } from './common/middleware/performance.middleware';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { BrandModule } from './modules/brand/brand.module';
import { ProductModule } from './modules/product/product.module';
import { BannerModule } from './modules/banner/banner.module';
import { ReviewModule } from './modules/review/review.module';
import { RolesGuard } from './common/guards/roles.guard';
import databaseConfig, { CONFIG_DATABASE } from './config/database.config';
import cacheConfig, { CACHE_CONFIG } from './config/cache.config';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { SearchModule } from './modules/elasticsearch/elasticsearch.module';
import { FaqModule } from './modules/faq/faq.module';
import { NewsModule } from './modules/news/news.module';
import { TelegramModule } from './shared/module/telegram/telegram.module';
import { OrderStatusModule } from './modules/order-status/order-status.module';
import googleConfig from './config/google.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import amocrmConfig from './config/amocrm.config';
import telegramConfig from './config/telegram.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        databaseConfig,
        cacheConfig,
        googleConfig,
        jwtConfig,
        redisConfig,
        amocrmConfig,
        telegramConfig,
      ],
      envFilePath: '.env',
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.get(CACHE_CONFIG);
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get(CONFIG_DATABASE).users.uri,
          maxPoolSize: 50, // Increased for better concurrency
          minPoolSize: 5,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 30000,
          maxIdleTimeMS: 30000,
          // Enable connection compression
          compressors: ['snappy', 'zlib'],
          // Add read preference for better performance
          readPreference: 'secondaryPreferred',
          // Connection pool monitoring
          monitorCommands: true,
          // Buffer max entries to prevent memory issues
          bufferMaxEntries: 0,
          bufferCommands: false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    BannerModule,
    ReviewModule,
    CartModule,
    FileUploadModule,
    OrderModule,
    SearchModule,
    FaqModule,
    NewsModule,
    TelegramModule,
    OrderStatusModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PerformanceMiddleware)
      .forRoutes('*');
      
    consumer
      .apply(AuthMiddleware)
      .exclude(
        '/',
        '/auth/google',
        '/banner/list',
        '/brand/list',
        '/category/list',
        '/product/list',
        // '/product/add',
        // 'product/update',
        '/product/search',
        '/product/get-product',
        '/review/list',
        '/faq/list',
        '/faq/get-faq',
        '/news/list',
        '/news/get-news',
        '/product/index-products',
        '/order/amocrm',
        '/amocrm/code',
      )
      .forRoutes('*');
  }
}
