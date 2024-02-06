import * as express from 'express';
import * as dotenv from 'dotenv';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './exception.filter';
import { WsAdapter } from '@nestjs/platform-ws';
// import { EventsGateway } from './gateway/events.gateway';

dotenv.config();

// const serverUrl = process.env.SERVER_URL;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const eventGatway = app.get(EventsGateway);
  // setInterval(() => eventGatway.sendMessage(), 2000); // 2 sec

  const reflector = app.get(Reflector);
  app.useGlobalFilters(new HttpExceptionFilter(reflector));
  app.useGlobalPipes(new ValidationPipe());
  app.use('/uploads', express.static('uploads'));
  const config = new DocumentBuilder()
    .setTitle('Pre-Screening App')
    .setDescription('PreScreenApi is an api containing all routes for the app')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });
  app.enableCors({
    // origin: ` ${process.env.FRONTEND_URL}`,
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
  });

  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(`${process.env.PORT}`);
  //   if (process.env.NODE_ENV === 'development') {
  //     // write swagger ui files
  //     get(`${serverUrl}/api/swagger-ui-bundle.js`, function (response) {
  //       response.pipe(
  //         createWriteStream('src/swagger-static/swagger-ui-bundle.js'),
  //       );
  //       console.log(
  //         `Swagger UI bundle file written to: 'src/swagger-static/swagger-ui-bundle.js'`,
  //       );
  //     });

  //     get(`${serverUrl}/api/swagger-ui-init.js`, function (response) {
  //       response.pipe(createWriteStream('src/swagger-static/swagger-ui-init.js'));
  //       console.log(
  //         `Swagger UI init file written to: 'src/swagger-static/swagger-ui-init.js'`,
  //       );
  //     });

  //     get(
  //       `${serverUrl}/api/swagger-ui-standalone-preset.js`,
  //       function (response) {
  //         response.pipe(
  //           createWriteStream(
  //             'src/swagger-static/swagger-ui-standalone-preset.js',
  //           ),
  //         );
  //         console.log(
  //           `Swagger UI standalone preset file written to: 'src/swagger-static/swagger-ui-standalone-preset.js'`,
  //         );
  //       },
  //     );

  //     get(`${serverUrl}/api/swagger-ui.css`, function (response) {
  //       response.pipe(createWriteStream('src/swagger-static/swagger-ui.css'));
  //       console.log(
  //         `Swagger UI css file written to: 'src/swagger-static/swagger-ui.css'`,
  //       );
  //     });
  //   }
}
bootstrap();
