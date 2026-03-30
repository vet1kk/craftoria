import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, switchMap, tap } from 'rxjs';

import { ClientRegistrationData, User } from '../models';
import { extractApiErrorMessage } from './api-error';
import { AuthApiService } from './auth-api.service';
import { I18nService } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authApiService = inject(AuthApiService);
  private readonly i18n = inject(I18nService);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  initialize(): Observable<void> {
    return this.authApiService.session().pipe(
      map((response) => response.data),
      tap((session) => {
        if (!session.authenticated || !session.user) {
          this.currentUser.set(null);
          return;
        }

        this.currentUser.set(session.user);
      }),
      map(() => void 0),
      catchError(() => {
        this.currentUser.set(null);
        return of(void 0);
      })
    );
  }

  login(email: string, password: string): Observable<{ success: boolean; message?: string }> {
    return this.authApiService.login(email, password).pipe(
      map((response) => {
        this.currentUser.set(response.data);

        return { success: true };
      }),
      catchError((error: unknown) => {
        return of({
          success: false,
          message: extractApiErrorMessage(error, 'Enabled to log in. Please check your credentials and try again.', this.i18n)
        });
      })
    );
  }

  register(registrationData: ClientRegistrationData): Observable<{ success: boolean; message?: string }> {
    return this.authApiService.register(registrationData).pipe(
      switchMap(() => this.login(registrationData.email, registrationData.password)),
      catchError((error: unknown) => {
        return of({
          success: false,
          message: extractApiErrorMessage(error, 'Enabled to register. Please try again.', this.i18n)
        });
      })
    );
  }

  logout(): Observable<void> {
    return this.authApiService.logout().pipe(
      map(() => void 0),
      finalize(() => {
        this.currentUser.set(null);
      })
    );
  }

  refreshProfile(): Observable<User | null> {
    return this.authApiService.profile().pipe(
      map((response) => {
        const mappedUser = response.data;

        this.currentUser.set(mappedUser);

        return mappedUser;
      })
    );
  }
}
