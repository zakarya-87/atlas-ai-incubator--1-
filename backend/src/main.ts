import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  try {
    // 1. Create the main HTTP application
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Set global prefix for all routes
    app.setGlobalPrefix('api');

    // --- COOKIE PARSER (Required for JWT cookie auth) ---
    app.use(cookieParser());

    // --- SECURITY HEADERS (Helmet) ---
    app.use(helmet());

    // --- CORS ---
    app.enableCors({
      origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          'http://atlas-ai-incubator-app.westus2.azurecontainer.io:8080',
          'http://atlas-ai-incubator-app.westus2.azurecontainer.io',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:8080',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5174',
          'http://127.0.0.1:8080',
        ].filter(Boolean) as string[];

        if (!origin) {
          // Allow requests without Origin header (e.g., curl, postman)
          callback(null, true);
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

    logger.log(`=================================================`);
    logger.log(`🚀 Server running at: ${await app.getUrl()}`);
    logger.log(`📄 Swagger Docs at: ${await app.getUrl()}/api/docs`);
    logger.log(`🛡️  Security Headers: Enabled (Helmet)`);
    logger.log(`⭐️ Ready to accept requests on port ${port}`);
    logger.log(`=================================================`);
  } catch (error: unknown) {
    logger.error('❌ Server failed to start:', error);
  }
}
void bootstrap();
