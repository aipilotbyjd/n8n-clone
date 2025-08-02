export * from './lib/application-user.module';
export * from './lib/commands/create-user.command';
export * from './lib/commands/update-user.command';
export * from './lib/commands/delete-user.command';
export * from './lib/commands/handlers/create-user.handler';
export * from './lib/commands/handlers/update-user.handler';
export * from './lib/commands/handlers/delete-user.handler';
export * from './lib/commands/handlers/login.handler';
export * from './lib/commands/login.command';
export * from './lib/queries/get-user-by-id.query';
export * from './lib/queries/get-user.query';
export * from './lib/queries/get-users.query';
export * from './lib/queries/authenticate-user.query';
export * from './lib/queries/handlers/get-user-by-id.handler';
export * from './lib/queries/handlers/get-user.handler';
export * from './lib/queries/handlers/get-users.handler';
export * from './lib/queries/handlers/authenticate-user.handler';
export * from './lib/services/user-store.service';

// Export handlers array for convenience
import { CreateUserHandler } from './lib/commands/handlers/create-user.handler';
import { UpdateUserHandler } from './lib/commands/handlers/update-user.handler';
import { DeleteUserHandler } from './lib/commands/handlers/delete-user.handler';
import { GetUserHandler } from './lib/queries/handlers/get-user.handler';
import { GetUsersHandler } from './lib/queries/handlers/get-users.handler';
import { AuthenticateUserHandler } from './lib/queries/handlers/authenticate-user.handler';

export const USER_HANDLERS = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  GetUserHandler,
  GetUsersHandler,
  AuthenticateUserHandler,
];

// Export types from shared/types for convenience
export { 
  CreateUserDto, 
  UpdateUserDto, 
  LoginDto, 
  AuthResponseDto,
  User as UserResponseDto
} from '@n8n-clone/shared/types';
