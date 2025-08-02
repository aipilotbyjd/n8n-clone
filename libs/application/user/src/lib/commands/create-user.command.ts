import { ICommand } from '@nestjs/cqrs';
import { UserRole } from '@n8n-clone/shared/types';

export class CreateUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly role: UserRole = UserRole.USER,
  ) {}
}
