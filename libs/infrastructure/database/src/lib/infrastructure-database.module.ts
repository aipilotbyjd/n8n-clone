import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepository } from './repositories/user.repository';
import { UserSchema } from './schemas/user.schema';
import { WorkflowSchema } from './schemas/workflow.schema';
import { USER_REPOSITORY } from '@n8n-clone/shared/common';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'n8n_clone'),
        entities: [UserSchema, WorkflowSchema],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserSchema, WorkflowSchema]),
  ],
  controllers: [],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY, TypeOrmModule],
})
export class InfrastructureDatabaseModule {}
