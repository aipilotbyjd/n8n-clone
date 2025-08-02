import { IQuery } from '@nestjs/cqrs';

export class GetCredentialQuery implements IQuery {
  constructor(public readonly id: string) {}
}
