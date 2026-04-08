import { inject, Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';

import { ApiResponse, AppSettings } from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsApiService {
  private readonly apiService = inject(ApiService);
  private settingsRequest$: Observable<ApiResponse<AppSettings>> | null = null;

  settings(): Observable<ApiResponse<AppSettings>> {
    if (!this.settingsRequest$) {
      this.settingsRequest$ = this.apiService.get<AppSettings>('/settings').pipe(
        catchError((error: unknown) => {
          this.settingsRequest$ = null;
          return throwError(() => error);
        }),
        shareReplay(1)
      );
    }

    return this.settingsRequest$;
  }
}