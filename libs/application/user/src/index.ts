export * from './lib/application-user.module';
export * from './lib/commands/create-user.command';
export * from './lib/commands/update-user.command';
export * from './lib/commands/handlers/create-user.handler';
export * from './lib/commands/handlers/update-user.handler';
export * from './lib/commands/handlers/login.handler';
export * from './lib/commands/login.command';
export * from './lib/queries/get-user-by-id.query';
export * from './lib/queries/get-users.query';
export * from './lib/queries/handlers/get-user-by-id.handler';
export * from './lib/queries/handlers/get-users.handler';

// Export types from shared/types for convenience
export { 
  CreateUserDto, 
  UpdateUserDto, 
  LoginDto, 
  AuthResponseDto,
  User as UserResponseDto
} from '@n8n-clone/shared/types';
