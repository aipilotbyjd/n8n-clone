import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

// Import our new NestJS libraries
import { SharedCommonModule } from '@n8n-clone/shared/common';
import { ApplicationWorkflowModule } from '@n8n-clone/application/workflow';
import { ApplicationUserModule } from '@n8n-clone/application/user';
import { DomainWorkflowModule } from '@n8n-clone/domain/workflow';
import { DomainUserModule } from '@n8n-clone/domain/user';
import { InfrastructureDatabaseModule } from '@n8n-clone/infrastructure/database';
import { InfrastructureSecurityModule } from '@n8n-clone/infrastructure/security';
import { AuthGuard } from '@n8n-clone/infrastructure/security';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkflowsController } from './workflows/workflows.controller';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'n8n_clone'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    CqrsModule,
    HttpModule,
    // New NestJS library modules
    SharedCommonModule,
    InfrastructureSecurityModule,
    InfrastructureDatabaseModule,
    DomainWorkflowModule,
    DomainUserModule,
    ApplicationWorkflowModule,
    ApplicationUserModule,
  ],
  controllers: [AppController, WorkflowsController, AuthController, UsersController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
