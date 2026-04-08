import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, ClientRegistrationData, JwtAuthData, SessionResponse, User } from '../../models';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly apiService = inject(ApiService);

  session(): Observable<ApiResponse<SessionResponse>> {
    return this.apiService.get<SessionResponse>('/session');
  }

  login(email: string, password: string): Observable<ApiResponse<JwtAuthData>> {
    return this.apiService.post<JwtAuthData>('/login', {
      email,
      password
    });
  }

  register(registrationData: ClientRegistrationData): Observable<ApiResponse<JwtAuthData>> {
    return this.apiService.post<JwtAuthData>('/register', {
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

  refresh(): Observable<ApiResponse<JwtAuthData>> {
    return this.apiService.post<JwtAuthData>('/refresh', {});
  }

  profile(): Observable<ApiResponse<User>> {
    return this.apiService.get<User>('/profile');
  }
}

