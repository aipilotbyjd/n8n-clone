import { Module } from '@nestjs/common';

import { ExpressionParserService } from './expression-parser.service';

@Module({
  providers: [ExpressionParserService],
  exports: [ExpressionParserService],
})
export class ExpressionParserModule {}
