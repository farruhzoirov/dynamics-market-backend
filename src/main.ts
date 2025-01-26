import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Swagger based
  const options = new DocumentBuilder()
      .setTitle('DYNAMIC MARKETS APIS')
      .setDescription("These apis for dynamics market")
      .setVersion('1.0')
      .addServer(`http://localhost:5000`, 'Local environment')
      .addServer('http://95.130.227.52:5000', 'Production')
      .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  // Server is running here
  await app.listen(5000);
}

bootstrap();
