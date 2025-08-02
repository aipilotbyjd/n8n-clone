/**
 * N8N Clone API Gateway
 * Main entry point for the microservices architecture
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security middleware
  app.use(helmet());
  
  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  
  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('N8N Clone API')
    .setDescription('The N8N Clone API documentation - A powerful workflow automation platform')
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
      'JWT-auth'
    )
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Workflows', 'Workflow management endpoints')
    .addTag('Executions', 'Workflow execution endpoints')
    .addTag('Nodes', 'Node management endpoints')
    .addTag('Credentials', 'Credential management endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Templates', 'Template management endpoints')
    .addTag('Health', 'Health check endpoints')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    customSiteTitle: 'N8N Clone API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(
    `🚀 API Gateway is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/${globalPrefix}/docs`
  );
}

bootstrap();
