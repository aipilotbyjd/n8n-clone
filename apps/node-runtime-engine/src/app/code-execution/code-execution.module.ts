import { Module } from '@nestjs/common';

import { CodeExecutionService } from './code-execution.service';

@Module({
  providers: [CodeExecutionService],
  exports: [CodeExecutionService],
})
export class CodeExecutionModule {}
