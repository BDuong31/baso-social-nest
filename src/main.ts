import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as swaggerUi from 'swagger-ui-express';
<<<<<<< HEAD
import { join } from 'path';
=======
>>>>>>> efdaa49413429817742950fdd6e8c5b28e4b7b6b

async function bootstrap() {
  // Tạo ứng dụng NestJS
  const app = await NestFactory.create(AppModule);

<<<<<<< HEAD


  // Cấu hình CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
=======
  // Cấu hình CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP cho phép
>>>>>>> efdaa49413429817742950fdd6e8c5b28e4b7b6b
  });

  // Cấu hình ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
<<<<<<< HEAD
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
=======
      whitelist: true, // Loại bỏ các trường không được khai báo trong DTO
      forbidNonWhitelisted: true, // Tự động từ chối các trường không được khai báo
      transform: true, // Tự động chuyển đổi kiểu dữ liệu của các trường
>>>>>>> efdaa49413429817742950fdd6e8c5b28e4b7b6b
    }),
  );

  // Cấu hình tài liệu Swagger
  const config = new DocumentBuilder()
    .setTitle('Baso Spark Network API')
    .setDescription('API for the Baso Spark social network platform.')
    .setVersion('1.0')
    .addBearerAuth() // Sử dụng BearerAuth cho các yêu cầu bảo mật
    .build();

<<<<<<< HEAD
=======
  // Tạo tài liệu Swagger
>>>>>>> efdaa49413429817742950fdd6e8c5b28e4b7b6b
  const document = SwaggerModule.createDocument(app, config);

  // Tùy chỉnh Swagger UI với logo, favicon và docExpansion
  app.use('/api', swaggerUi.serve, swaggerUi.setup(document, {
<<<<<<< HEAD
    customJs: '/assets/swagger.js',
=======
    customJs: '/assets/swagger.js', 
>>>>>>> efdaa49413429817742950fdd6e8c5b28e4b7b6b
    customfavIcon: 'http://localhost:3000/assets/logo.png', // Đảm bảo đường dẫn đúng tới favicon
    customSiteTitle: 'Baso Spark API',
  }));

<<<<<<< HEAD
=======
  // Chạy ứng dụng trên cổng 3000
>>>>>>> efdaa49413429817742950fdd6e8c5b28e4b7b6b
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

<<<<<<< HEAD
bootstrap();
=======
// Khởi chạy ứng dụng
bootstrap();
>>>>>>> efdaa49413429817742950fdd6e8c5b28e4b7b6b
