import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, CreateOrderItemPayload, CreateOrderPayload, Order } from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderApiService {
  private readonly apiService = inject(ApiService);

  createOrder(payload: CreateOrderPayload): Observable<ApiResponse<Order>> {
    return this.apiService.post<Order>('/orders', payload);
  }

  createOrderItem(orderId: string, payload: CreateOrderItemPayload): Observable<ApiResponse<Order>> {
    return this.apiService.post<Order>(`/orders/${orderId}/items`, payload);
  }
}

