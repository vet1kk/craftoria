import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResourceResponse, ClientRegistrationData, SessionResponse, User } from '../models';
import { extractApiErrorMessage } from './api-error';
import { I18nService } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  async initialize(): Promise<void> {
    try {
      const session = await firstValueFrom(
        this.http.get<SessionResponse>(`${environment.apiUrl}/session`)
      );

      if (!session.authenticated || !session.user) {
        this.currentUser.set(null);
        return;
      }

      this.currentUser.set(session.user);
    } catch {
      this.currentUser.set(null);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResourceResponse<User>>(`${environment.apiUrl}/login`, {
          email,
          password
        })
      );

      this.currentUser.set(response.data);

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        message: extractApiErrorMessage(error, 'Enabled to log in. Please check your credentials and try again.', this.i18n)
      };
    }
  }

  async register(registrationData: ClientRegistrationData): Promise<{ success: boolean; message?: string }> {
    try {
      await firstValueFrom(
        this.http.post<ApiResourceResponse<User>>(`${environment.apiUrl}/register`, {
          name: registrationData.name,
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
        message: extractApiErrorMessage(error, 'Enabled to register. Please try again.', this.i18n)
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>(`${environment.apiUrl}/logout`, {}));
    } finally {
      this.currentUser.set(null);
    }
  }

  async refreshProfile(): Promise<User | null> {
    const response = await firstValueFrom(
      this.http.get<ApiResourceResponse<User>>(`${environment.apiUrl}/profile`)
    );
    const mappedUser = response.data;

    this.currentUser.set(mappedUser);

    return mappedUser;
  }
}
