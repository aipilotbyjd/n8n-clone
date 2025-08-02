import { ICommand } from '@nestjs/cqrs';

export class CreateCredentialCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly data: Record<string, any>,
    public readonly userId: string,
  ) {}
}
