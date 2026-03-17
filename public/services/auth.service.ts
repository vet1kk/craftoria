import { computed, Injectable, signal } from '@angular/core';

import { ClientRegistrationData, toUser, User } from '../models';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private readonly userService: UserService) {}

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // TODO(api): Replace the local credential lookup with a backend login endpoint
  // that returns the authenticated user and session/token payload.
  login(email: string, password: string): { success: boolean; message?: string } {
    const matchedUser = this.userService.findUserByCredentials(email, password);

    if (!matchedUser) {
      return {
        success: false,
        message: 'Невірний email або пароль.'
      };
    }

    this.currentUser.set(toUser(matchedUser));

    return { success: true };
  }

  // TODO(api): Replace the local registration flow with a backend sign-up endpoint.
  register(registrationData: ClientRegistrationData): { success: boolean; message?: string } {
    try {
      const createdUser = this.userService.createClientUser(registrationData);
      this.currentUser.set(toUser(createdUser));
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Не вдалося створити обліковий запис.'
      };
    }
  }

  // TODO(api): When backend auth is added, this should also call a logout/session revoke endpoint
  // or clear persisted auth tokens managed by the API client.
  logout(): void {
    this.currentUser.set(null);
  }

  // TODO(api): Replace this local session update with either a "current user" refetch
  // or the response from backend profile/order endpoints.
  updateCurrentUser(user: User): void {
    this.currentUser.set(toUser(user));
  }
}
