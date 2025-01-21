import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import * as process from "node:process";
import * as passport from "passport";
import * as session from 'express-session';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(
  //   session({
  //     secret: 'your-secret-key',
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: {
  //       maxAge: 600000,
  //       secure: false
  //     },
  //   }),
  // );
  //
  // // Initialize passport and enable session support
  app.use(passport.initialize());
  // app.use(passport.session());


  // Swagger based
  const options = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('Your API description')
    .setVersion('1.0')
    .addServer(`http://localhost:${process.env.APP_PORT}`, 'Local environment')
    .addServer('https://staging.yourapi.com/', 'Staging')
    .addServer('https://production.yourapi.com/', 'Production')
    .addTag('Your API Tag')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  // Server is running here
  await app.listen(process.env.APP_PORT ?? 3000);
}

bootstrap();
