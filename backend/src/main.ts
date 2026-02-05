import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    // 1. Create the main HTTP application
    const app = await NestFactory.create(AppModule);

    // --- COOKIE PARSER (Required for JWT cookie auth) ---
    app.use(cookieParser());

    // --- SECURITY HEADERS (Helmet) ---
    app.use(helmet());

    // --- CORS ---
    app.enableCors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          'http://localhost:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5174',
        ].filter(Boolean) as string[];

        if (!origin) {
          if (process.env.NODE_ENV === 'production') {
            callback(new Error('Origin required in production'));
          } else {
            callback(null, true);
          }
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else if (process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked: ${origin}`));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Accept, Authorization',
      credentials: true,
    });

    // Global Validation Pipe for DTOs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );

    // Global Error Handling
    app.useGlobalFilters(new HttpExceptionFilter());

    // --- SWAGGER CONFIGURATION ---
    const config = new DocumentBuilder()
      .setTitle('ATLAS AI Incubator API')
      .setDescription(
        'API documentation for the ATLAS AI platform backend services.'
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Listen on environment port or default to 3000
    const port = process.env.PORT || 3000;

    // Start HTTP listener
    await app.listen(port, '0.0.0.0');

    console.log(`=================================================`);
    console.log(`🚀 Server running at: ${await app.getUrl()}`);
    console.log(`📄 Swagger Docs at: ${await app.getUrl()}/api/docs`);
    console.log(`🛡️  Security Headers: Enabled (Helmet)`);
    console.log(`⭐️ Ready to accept requests on port ${port}`);
    console.log(`=================================================`);
  } catch (error) {
    console.error('❌ Server failed to start:', error);
  }
}
bootstrap();
