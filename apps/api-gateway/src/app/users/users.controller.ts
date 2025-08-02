import { Controller, Get, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiSuccessResponse, ApiErrorResponse } from '@n8n-clone/shared/common';
import { GetUsersQuery, GetUserByIdQuery } from '@n8n-clone/application/user';
import { AuthGuard } from '@n8n-clone/infrastructure/security';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiSuccessResponse('Users retrieved successfully')
  async getUsers(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    try {
      const users = await this.queryBus.execute(new GetUsersQuery());

      return {
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get users:', error);
      throw error;
    }
  }

  @Get(':userId')
  @ApiSuccessResponse('User retrieved successfully')
  @ApiErrorResponse(404, 'User not found')
  async getUser(@Param('userId') userId: string) {
    try {
      const user = await this.queryBus.execute(new GetUserByIdQuery(userId));

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        data: user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get user ${userId}:`, error);
      throw error;
    }
  }
}
