
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  try {
    // Configure Winston Logger
    const logger = WinstonModule.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.ms(),
                    process.env.NODE_ENV === 'production' 
                        ? winston.format.json() 
                        : winston.format.combine(
                            winston.format.colorize(),
                            winston.format.nestLike('ATLAS', { prettyPrint: true })
                          )
                ),
            }),
        ],
    });

    // 1. Create the main HTTP application
    const app = await NestFactory.create(AppModule, {
        logger: logger
    });
    
    // 2. Enable Microservice capabilities (Hybrid App)
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: 3001, // Internal microservice port
        },
    });

    // --- SECURITY HEADERS (Helmet) ---
    app.use(helmet.default());

    // --- RESPONSE COMPRESSION (Gzip) ---
    app.use(compression());

    // --- COOKIE PARSER ---
    app.use(cookieParser());

    // --- CORS ---
    app.enableCors({
      origin: process.env.FRONTEND_URL || true, // Restrict in production
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Global Validation Pipe for DTOs
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Strip properties not in the DTO
      transform: true, // Automatically transform payloads to DTO instances
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
    // -----------------------------

    // Listen on environment port or default to 3000
    const port = process.env.PORT || 3000;
    
    if (!process.env.API_KEY) {
        logger.warn("WARNING: API_KEY is not set in backend/.env. AI generation will fail.");
    }

    // Start both HTTP and Microservice listeners
    await app.startAllMicroservices();
    await app.listen(port, '0.0.0.0');
    
    logger.log(`=================================================`);
    logger.log(`🚀 Server running at: ${await app.getUrl()}`);
    logger.log(`📄 Swagger Docs at: ${await app.getUrl()}/api/docs`);
    logger.log(`📡 Microservice listening on port 3001`);
    logger.log(`🛡️  Security Headers: Enabled (Helmet)`);
    logger.log(`📦 Compression: Enabled (Gzip)`);
    logger.log(`⭐️ Ready to accept requests on port ${port}`);
    logger.log(`=================================================`);
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
}
bootstrap();