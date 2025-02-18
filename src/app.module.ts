import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {APP_GUARD} from "@nestjs/core";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";
// configs
import databaseConfig, {CONFIG_DATABASE} from "./config/database.config";
import googleConfig from "./config/google.config";
import jwtConfig from "./config/jwt.config";
// Middleware
import {AuthMiddleware} from "./shared/middleware/auth.middleware";
// Modules
import {AuthModule} from './modules/auth/auth.module';
import {UserModule} from "./modules/user/user.module";
import {MainCategoryModule} from './modules/category/main-category/main-category.module';
import {MidCategoryModule} from './modules/category/mid-category/mid-category.module';
import {SubCategoryModule} from './modules/category/sub-category/sub-category.module';
import {CategoryModule} from './modules/category/category.module';
import {FileUploadModule} from './modules/file-upload/file-upload.module';
import {BrandModule} from './modules/brand/brand.module';

import {RolesGuard} from "./common/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, googleConfig, jwtConfig],
      envFilePath: '.env',
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get(CONFIG_DATABASE).users.uri
        }
      },
      inject: [ConfigService]
    }),
    AuthModule,
    UserModule,
    MainCategoryModule,
    MidCategoryModule,
    SubCategoryModule,
    CategoryModule,
    BrandModule,
    FileUploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(AuthMiddleware)
        .exclude('/auth/google')
        .forRoutes('*')
  }
}
