import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule, ConfigService} from "@nestjs/config";

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './modules/auth/auth.module';

import databaseConfig, {CONFIG_DATABASE} from "./config/database.config";
import googleConfig from "./config/google.config";

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
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
