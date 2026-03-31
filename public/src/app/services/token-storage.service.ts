import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly tokenStorageKey = 'craftoria_access_token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenStorageKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenStorageKey);
  }
}
