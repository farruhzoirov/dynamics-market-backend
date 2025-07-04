import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthMiddleware } from './shared/middleware/auth.middleware';
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
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { SearchModule } from './modules/elasticsearch/elasticsearch.module';
import { FaqModule } from './modules/faq/faq.module';
import { NewsModule } from './modules/news/news.module';
import { TelegramModule } from './shared/module/telegram/telegram.module';
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
        googleConfig,
        jwtConfig,
        redisConfig,
        amocrmConfig,
        telegramConfig,
      ],
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get(CONFIG_DATABASE).users.uri,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
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
