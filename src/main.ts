import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import * as process from "node:process";
import * as passport from "passport";


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
      .setTitle('DYNAMIC MARKETS APIS')
      .setDescription("These apis for dynamics market")
      .setVersion('1.0')
      .addServer(`http://localhost:5000`, 'Local environment')
      .addServer('http://95.130.227.52:3000', 'Production')
      .addTag('Your API Tag')
      .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  // Server is running here
  await app.listen(5000);
}

bootstrap();
