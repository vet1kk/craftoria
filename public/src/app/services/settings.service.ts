import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AppSettings } from '../models';
import { environment } from '../../environments/environment';

interface ApiAppSettingsResponse {
  data: AppSettings;
}

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  private readonly http = inject(HttpClient);

  async settings(): Promise<ApiAppSettingsResponse> {
    return firstValueFrom(this.http.get<ApiAppSettingsResponse>(`${environment.apiUrl}/settings`));
  }
}