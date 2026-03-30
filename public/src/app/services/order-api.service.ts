import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models';
import { ApiService } from './api.service';

export interface SubmitOrderPayload {
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string;
  fulfillment_type: 'pickup';
  currency: string;
  payment_method: 'cash';
  items: Array<{
    product_id: string;
    quantity: number;
    notes: string | null;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrderApiService {
  private readonly apiService = inject(ApiService);

  submit(payload: SubmitOrderPayload): Observable<ApiResponse<unknown>> {
    return this.apiService.post<unknown>('/orders', payload);
  }
}

