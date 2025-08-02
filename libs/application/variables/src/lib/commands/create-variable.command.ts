import { ICommand } from '@nestjs/cqrs';

export class CreateVariableCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly value: string,
    public readonly type: string,
    public readonly scope: string,
    public readonly isProtected: boolean = false,
  ) {}
}
