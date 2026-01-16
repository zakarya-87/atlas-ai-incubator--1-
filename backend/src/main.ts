import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  try {
    // 1. Create the main HTTP application
    const app = await NestFactory.create(AppModule);

    // --- SECURITY HEADERS (Helmet) ---
    app.use(helmet());

    // --- CORS ---
    app.enableCors({
      origin: (origin, callback) => {
        const allowed = [
          process.env.FRONTEND_URL,
          'http://localhost:5173',
          'http://localhost:5174'
        ].filter(Boolean) as string[];
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked: ${origin}`));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Global Validation Pipe for DTOs
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    // Global Error Handling
    app.useGlobalFilters(new HttpExceptionFilter());

    // --- SWAGGER CONFIGURATION ---
    const config = new DocumentBuilder()
      .setTitle('ATLAS AI Incubator API')
      .setDescription('API documentation for the ATLAS AI platform backend services.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Listen on environment port or default to 3000
    const port = process.env.PORT || 3000;

    // Basic env validation
    const required = ['JWT_SECRET', 'API_KEY'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
      console.warn(`WARNING: Missing env vars: ${missing.join(', ')}`);
    }

    if (!process.env.API_KEY) {
      console.warn("WARNING: API_KEY is not set in backend/.env. AI generation will fail.");
    }

    // Start HTTP listener
    await app.listen(port, '0.0.0.0');

    console.log(`=================================================`);
    console.log(`🚀 Server running at: ${await app.getUrl()}`);
    console.log(`📄 Swagger Docs at: ${await app.getUrl()}/api/docs`);
    console.log(`🛡️  Security Headers: Enabled (Helmet)`);
    console.log(`⭐️ Ready to accept requests on port ${port}`);
    console.log(`=================================================`);
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
}
bootstrap();