import { ICommand } from '@nestjs/cqrs';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly updates: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: string;
      status?: string;
      preferences?: any;
    }
  ) {}
}
