import { ICommand } from '@nestjs/cqrs';
import { UserRole } from '@n8n-clone/shared/types';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly email?: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly role?: UserRole,
    public readonly isActive?: boolean,
  ) {}
}
