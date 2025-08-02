export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EDITOR = 'editor',
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  role?: UserRole;
}
