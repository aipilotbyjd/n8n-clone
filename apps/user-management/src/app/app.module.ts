import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/modules/users.module';
import { WorkspacesService } from './workspaces/workspaces.service';
import { PermissionsService } from './permissions/permissions.service';
import { CollaborationService } from './collaboration/collaboration.service';

@Module({
  imports: [UsersModule],
  controllers: [AppController],
  providers: [
    AppService,
    WorkspacesService,
    PermissionsService,
    CollaborationService,
  ],
})
export class AppModule {}
