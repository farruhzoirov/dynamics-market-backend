import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {UserModule} from './modules/user/user.module';
import {AuthModule} from './modules/auth/auth.module';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";
import databaseConfig, {CONFIG_DATABASE} from "./config/database.config";
import googleConfig from "./config/google.config";
import {PassportModule} from "@nestjs/passport";

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
    PassportModule.register({session: true}),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {

}
