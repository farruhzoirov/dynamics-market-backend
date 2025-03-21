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
import { RolesGuard } from './common/guards/roles.guard';
import databaseConfig, { CONFIG_DATABASE } from './config/database.config';
import googleConfig from './config/google.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, googleConfig, jwtConfig],
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log(configService.get(CONFIG_DATABASE).users.uri);
        return {
          uri: configService.get(CONFIG_DATABASE).users.uri,
          writeConcern: { w: 'majority' },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    FileUploadModule,
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
        '/auth/google',
        '/',
        '/category/front/get-list',
        '/product/front/get-list',
      )
      .forRoutes('*');
  }
}
