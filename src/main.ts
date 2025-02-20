import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import * as process from "node:process";
import {NestExpressApplication} from "@nestjs/platform-express";
import {AllExceptionsTo200Interceptor} from "./common/interceptors/universal-response";
import {BadRequestException, ValidationPipe} from "@nestjs/common";
import {ErrorCodes} from "./common/errors/error-codes";


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, Language, Accept',
  });


  // Swagger based
  const options = new DocumentBuilder()
      .setTitle('DYNAMICS MARKETS APIS')
      .setDescription("These apis for dynamics market")
      .setVersion('1.0')
      .addServer(`http://localhost:5000`, 'Local environment')
      .addServer('https://dynamics-market-437742f0667d.herokuapp.com', 'Production')
      .addBearerAuth()
      .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        exceptionFactory: (errors: any) => {
          const formattedErrors = errors.map(err => ({
            field: err.property,
            message: Object.values(err.constraints || {}).join(", "),
          }));
          return {
            success: false,
            errorCode: `${ErrorCodes.VALIDATION_ERROR}`,
            message: formattedErrors,
          }
        },
      })
  );
  app.useStaticAssets('uploads', {prefix: '/uploads'});
  app.useGlobalInterceptors(new AllExceptionsTo200Interceptor());
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`);
  });
}


bootstrap();
