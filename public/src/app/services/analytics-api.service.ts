import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AnalyticsEventPayload, ApiResponse } from '../models';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class AnalyticsApiService {
  private readonly apiService = inject(ApiService);

  createEvent(payload: AnalyticsEventPayload): Observable<ApiResponse<unknown>> {
    return this.apiService.post<unknown>('/analytics/events', payload);
  }
}

