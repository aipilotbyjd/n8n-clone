import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'User Management Service - Ready to handle user operations, workspaces, permissions, and collaboration features.' };
  }
}
