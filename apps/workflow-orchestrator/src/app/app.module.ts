import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExecutionModule } from './execution/execution.module';
import { StateManagementModule } from './state-management/state-management.module';
import { FlowControlModule } from './flow-control/flow-control.module';
import { ErrorHandlingModule } from './error-handling/error-handling.module';

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
      }),
      inject: [ConfigService],
    }),
    CqrsModule,
    EventEmitterModule.forRoot(),
    ExecutionModule,
    StateManagementModule,
    FlowControlModule,
    ErrorHandlingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
