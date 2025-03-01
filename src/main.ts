import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as swaggerUi from 'swagger-ui-express';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP cho phép
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các trường không được khai báo trong DTO
      forbidNonWhitelisted: true, // Tự động từ chối các trường không được khai báo
      transform: true, // Tự động chuyển đổi kiểu dữ liệu của các trường
    }),
  );

  // ✅ Chỉ set WebSocket Adapter một lần
  if (!app.getHttpAdapter().getInstance()._io) {
    app.useWebSocketAdapter(new IoAdapter(app));
  }

  const config = new DocumentBuilder()
    .setTitle('Baso Spark Network API')
    .setDescription('API for the Baso Spark social network platform.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Tạo tài liệu Swagger
  const document = SwaggerModule.createDocument(app, config);

  // Tùy chỉnh Swagger UI với logo, favicon và docExpansion
  app.use('/api', swaggerUi.serve, swaggerUi.setup(document, {
    customJs: '/assets/swagger.js', 
    customfavIcon: 'http://localhost:3000/assets/logo.png', // Đảm bảo đường dẫn đúng tới favicon
    customSiteTitle: 'Baso Spark API',
  }));

  // Chạy ứng dụng trên cổng 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

// Khởi chạy ứng dụng
bootstrap();