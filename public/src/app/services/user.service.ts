import { computed, inject, Injectable, signal } from '@angular/core';

import { User } from '../models';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly tokenStorage = inject(TokenStorageService);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  setCurrentUser(user: User | null): void {
    this.currentUser.set(user);
  }

  clearCurrentUser(): void {
    this.currentUser.set(null);
  }

  setToken(token: string): void {
    this.tokenStorage.setToken(token);
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  clearToken(): void {
    this.tokenStorage.clearToken();
  }
}
