import { IQuery } from '@nestjs/cqrs';

export class GetWorkflowByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
