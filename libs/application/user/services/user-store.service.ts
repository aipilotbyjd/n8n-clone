import { Injectable } from '@nestjs/common';

@Injectable()
export class UserStoreService {
  private users = new Map<string, any>();

  getUser(id: string): any | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): any | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  getAllUsers(): any[] {
    return Array.from(this.users.values());
  }

  saveUser(user: any): void {
    this.users.set(user.id, user);
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  hasUser(id: string): boolean {
    return this.users.has(id);
  }

  hasUserByEmail(email: string): boolean {
    return this.getUserByEmail(email) !== undefined;
  }
}
