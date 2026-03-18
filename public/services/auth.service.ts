import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../environments/environment';
import { ClientRegistrationData, User } from '../models';
import { extractApiErrorMessage } from './api-error';
import { ApiUser, UserService } from './user.service';

interface ApiResourceResponse<T> {
  data: T;
}

interface ApiSessionResponse {
  authenticated: boolean;
  user: ApiUser | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  async initialize(): Promise<void> {
    try {
      const session = await firstValueFrom(
        this.http.get<ApiSessionResponse>(`${environment.apiBaseUrl}/session`)
      );

      if (!session.authenticated || !session.user) {
        this.currentUser.set(null);
        return;
      }

      this.currentUser.set(this.userService.mapUser(session.user));
    } catch {
      this.currentUser.set(null);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResourceResponse<ApiUser>>(`${environment.apiBaseUrl}/login`, {
          email,
          password
        })
      );

      this.currentUser.set(this.userService.mapUser(response.data));

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        message: extractApiErrorMessage(error, 'Не вдалося увійти.')
      };
    }
  }

  async register(registrationData: ClientRegistrationData): Promise<{ success: boolean; message?: string }> {
    try {
      await firstValueFrom(
        this.http.post<ApiResourceResponse<ApiUser>>(`${environment.apiBaseUrl}/register`, {
          name: registrationData.fullName,
          email: registrationData.email,
          phone: registrationData.phone,
          password: registrationData.password,
          password_confirmation: registrationData.password
        })
      );

      return this.login(registrationData.email, registrationData.password);
    } catch (error: unknown) {
      return {
        success: false,
        message: extractApiErrorMessage(error, 'Не вдалося створити обліковий запис.')
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>(`${environment.apiBaseUrl}/logout`, {}));
    } finally {
      this.currentUser.set(null);
    }
  }

  async refreshProfile(): Promise<User | null> {
    const response = await firstValueFrom(
      this.http.get<ApiResourceResponse<ApiUser>>(`${environment.apiBaseUrl}/profile`)
    );
    const mappedUser = this.userService.mapUser(response.data);

    this.currentUser.set(mappedUser);

    return mappedUser;
  }
}
