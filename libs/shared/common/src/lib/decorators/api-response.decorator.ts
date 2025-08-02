import { applyDecorators, Type } from '@nestjs/common';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  timestamp!: string;
}

export const ApiSuccessResponse = <T>(
  type?: Type<T> | Function | [Function] | string,
  description?: string,
) =>
  applyDecorators(
    ApiResponse({
      status: 200,
      description: description || 'Success',
      type: ApiResponseDto,
    }),
  );

export const ApiErrorResponse = (status: number, description: string) =>
  applyDecorators(
    ApiResponse({
      status,
      description,
      type: ApiResponseDto,
    }),
  );
