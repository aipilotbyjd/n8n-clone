// Commands
export * from '../commands/create-user.command';
export * from '../commands/update-user.command';
export * from '../commands/delete-user.command';

// Queries
export * from '../queries/get-user.query';
export * from '../queries/get-users.query';
export * from '../queries/authenticate-user.query';

// Handlers
export * from '../handlers/create-user.handler';
export * from '../handlers/update-user.handler';
export * from '../handlers/delete-user.handler';
export * from '../handlers/get-user.handler';
export * from '../handlers/get-users.handler';
export * from '../handlers/authenticate-user.handler';

// DTOs
export * from '../dtos/create-user.dto';
export * from '../dtos/update-user.dto';
export * from '../dtos/auth.dto';

// Services
export * from '../services/user-store.service';

// Events (if needed later)
export * from '../events';

// Collect all handlers for easy import
import { CreateUserHandler } from '../handlers/create-user.handler';
import { UpdateUserHandler } from '../handlers/update-user.handler';
import { DeleteUserHandler } from '../handlers/delete-user.handler';
import { GetUserHandler } from '../handlers/get-user.handler';
import { GetUsersHandler } from '../handlers/get-users.handler';
import { AuthenticateUserHandler } from '../handlers/authenticate-user.handler';

export const USER_COMMAND_HANDLERS = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
];

export const USER_QUERY_HANDLERS = [
  GetUserHandler,
  GetUsersHandler,
  AuthenticateUserHandler,
];

export const USER_HANDLERS = [
  ...USER_COMMAND_HANDLERS,
  ...USER_QUERY_HANDLERS,
];
