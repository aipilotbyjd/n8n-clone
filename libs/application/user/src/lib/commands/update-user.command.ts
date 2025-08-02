import { ICommand } from '@nestjs/cqrs';
import { UserRole } from '@n8n-clone/shared/types';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly updates: {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      status?: string;
      preferences?: any;
    }
  ) {}
}
