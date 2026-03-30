import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models';
import { ApiService } from './api.service';

export interface AnalyticsEventPayload {
  session_id: string | null;
  name: string;
  url: string | undefined;
  properties: Record<string, unknown>;
  occurred_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsApiService {
  private readonly apiService = inject(ApiService);

  createEvent(payload: AnalyticsEventPayload): Observable<ApiResponse<unknown>> {
    return this.apiService.post<unknown>('/analytics/events', payload);
  }
}

