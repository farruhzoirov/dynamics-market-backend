import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationError } from 'class-validator';
import { AllExceptionsTo200Interceptor } from './common/interceptors/universal-response';
import { ErrorCodes } from './common/errors/error-codes';

import * as basicAuth from 'express-basic-auth';
import * as process from 'node:process';
import * as dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.use(
  //   helmet({
  //     contentSecurityPolicy: {
  //       useDefaults: true,
  //       directives: {
  //         defaultSrc: ["'self'"],
  //         imgSrc: [
  //           "'self'",
  //           'data:',
  //           'blob:',
  //           'https://backend.dynamics-market.uz',
  //         ],
  //         mediaSrc: ["'self'", 'https://backend.dynamics-market.uz'],
  //       },
  //     },
  //   }),
  // );
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Content-Type, Authorization, Accept-Language, App-Type, Accept',
  });

  app.use(
    ['/api-docs'],
    basicAuth({
      challenge: true,
      users: { admin: process.env.SWAGGER_PASSWORD },
    }),
  );

  // Swagger-based
  const options = new DocumentBuilder()
    .setTitle('DYNAMICS MARKETS APIS')
    .setDescription('These apis for dynamics market')
    .setVersion('1.0')
    .addServer(`http://localhost:5000`, 'Local environment')
    .addServer(`http://localhost:4000`, 'Local environment-2')

    .addServer('https://backend.dynamics-market.uz', 'Production')
    .addServer('https://ffba-185-213-230-61.ngrok-free.app', 'Tunnelling.ngrok')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((err: ValidationError) => ({
          field: err.property,
          message: Object.values(err.constraints || {}).join(', '),
        }));
        return {
          success: false,
          errorCode: `${ErrorCodes.VALIDATION_ERROR}`,
          message: formattedErrors,
        };
      },
    }),
  );
  app.useStaticAssets('uploads', { prefix: '/uploads' });
  app.useGlobalInterceptors(new AllExceptionsTo200Interceptor());
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}.`);
  });
}

bootstrap();
