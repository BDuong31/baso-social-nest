import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as swaggerUi from 'swagger-ui-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);



  // Cấu hình CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Cấu hình ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cấu hình tài liệu Swagger
  const config = new DocumentBuilder()
    .setTitle('Baso Spark Network API')
    .setDescription('API for the Baso Spark social network platform.')
    .setVersion('1.0')
    .addBearerAuth() // Sử dụng BearerAuth cho các yêu cầu bảo mật
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Tùy chỉnh Swagger UI với logo, favicon và docExpansion
  app.use('/api', swaggerUi.serve, swaggerUi.setup(document, {
    customJs: '/assets/swagger.js',
    customfavIcon: 'http://localhost:3000/assets/logo.png', // Đảm bảo đường dẫn đúng tới favicon
    customSiteTitle: 'Baso Spark API',
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();