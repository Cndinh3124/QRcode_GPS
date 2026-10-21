import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';

  // Production phai khai bao domain frontend ro rang.
  const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  if (isProduction && frontendUrls.length === 0) {
    throw new Error('FRONTEND_URL phai duoc khai bao trong production.');
  }

  // Ung dung nam sau ALB va Nginx: tin dung dung hai proxy hop nay.
  app.set('trust proxy', 2);
  app.use(helmet());
  app.enableCors({
    origin: frontendUrls,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Chi mo Swagger khi phat trien, khong de lo tai lieu API tren production.
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('QR Event Check-in API')
      .setDescription('Backend API for QR + GPS Event Check-in System')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
