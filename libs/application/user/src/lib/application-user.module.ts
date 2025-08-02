import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DomainUserModule } from '@n8n-clone/domain/user';
import { InfrastructureSecurityModule } from '@n8n-clone/infrastructure/security';
import { CreateUserHandler } from './commands/handlers/create-user.handler';
import { LoginHandler } from './commands/handlers/login.handler';
import { GetUsersHandler } from './queries/handlers/get-users.handler';
import { GetUserByIdHandler } from './queries/handlers/get-user-by-id.handler';

const CommandHandlers = [CreateUserHandler, LoginHandler];
const QueryHandlers = [GetUsersHandler, GetUserByIdHandler];

@Module({
  imports: [CqrsModule, DomainUserModule, InfrastructureSecurityModule],
  controllers: [],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class ApplicationUserModule {}
