import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../users.service';
import {
  USER_HANDLERS,
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  GetUserHandler,
  GetUsersHandler,
  AuthenticateUserHandler,
  UserStoreService,
} from '@n8n-clone/application/user';

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserStoreService,
    // Command Handlers
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    // Query Handlers
    GetUserHandler,
    GetUsersHandler,
    AuthenticateUserHandler,
  ],
  exports: [UsersService],
})
export class UsersModule {}
