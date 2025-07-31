import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Runtime modules
import { RuntimeModule } from './runtime/runtime.module';
import { CodeExecutionModule } from './code-execution/code-execution.module';
import { ExpressionParserModule } from './expression-parser/expression-parser.module';
import { SandboxModule } from './sandbox/sandbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CqrsModule,
    HttpModule,
    RuntimeModule,
    CodeExecutionModule,
    ExpressionParserModule,
    SandboxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
