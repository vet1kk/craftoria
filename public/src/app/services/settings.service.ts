import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, AppSettings } from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsApiService {
  private readonly apiService = inject(ApiService);

  settings(): Observable<ApiResponse<AppSettings>> {
    return this.apiService.get<AppSettings>('/settings');
  }
}