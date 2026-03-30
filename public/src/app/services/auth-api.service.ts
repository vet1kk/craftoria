import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, ClientRegistrationData, SessionResponse, User } from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly apiService = inject(ApiService);

  session(): Observable<ApiResponse<SessionResponse>> {
    return this.apiService.get<SessionResponse>('/session');
  }

  login(email: string, password: string): Observable<ApiResponse<User>> {
    return this.apiService.post<User>('/login', {
      email,
      password
    });
  }

  register(registrationData: ClientRegistrationData): Observable<ApiResponse<User>> {
    return this.apiService.post<User>('/register', {
      name: registrationData.name,
      email: registrationData.email,
      phone: registrationData.phone,
      password: registrationData.password,
      password_confirmation: registrationData.password
    });
  }

  logout(): Observable<ApiResponse<void>> {
    return this.apiService.post<void>('/logout', {});
  }

  profile(): Observable<ApiResponse<User>> {
    return this.apiService.get<User>('/profile');
  }
}

