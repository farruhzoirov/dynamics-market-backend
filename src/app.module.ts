import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule, ConfigService} from "@nestjs/config";
// configs
import databaseConfig, {CONFIG_DATABASE} from "./config/database.config";
import googleConfig from "./config/google.config";
// Middleware
import {AuthMiddleware} from "./shared/middleware/auth.middleware";
// Modules
import {AuthModule} from './modules/auth/auth.module';
import {UserModule} from "./modules/user/user.module";
import {MainCategoryModule} from './modules/category/main-category/main-category.module';
import {MidCategoryModule} from './modules/category/mid-category/mid-category.module';
import {SubCategoryModule} from './modules/category/sub-category/sub-category.module';
import {CategoryModule} from './modules/category/category.module';
import {APP_GUARD} from "@nestjs/core";
import {RolesGuard} from "./shared/guards/roles.guard";
import { UploaderModule } from './uploader/uploader.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, googleConfig],
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
    UploaderModule,
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
