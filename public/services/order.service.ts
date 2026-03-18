import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../environments/environment';
import { OrderRequest } from '../models';
import { extractApiErrorMessage } from './api-error';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  async submitOrder(orderRequest: OrderRequest): Promise<void> {
    const currentUser = this.authService.currentUser();

    try {
      await firstValueFrom(
        this.http.post(`${environment.apiBaseUrl}/orders`, {
          customer_name: currentUser?.fullName ?? null,
          customer_email: currentUser?.email ?? null,
          customer_phone: orderRequest.phone,
          fulfillment_type: 'pickup',
          currency: 'UAH',
          payment_method: 'cash',
          items: orderRequest.items.map((item) => ({
            product_id: item.menuItem.id,
            quantity: item.quantity,
            notes: item.notes?.trim() || null
          }))
        })
      );

      if (currentUser) {
        await this.authService.refreshProfile().catch(() => null);
      }
    } catch (error: unknown) {
      throw new Error(extractApiErrorMessage(error, 'Failed to submit the order. Please try again later.'));
    }
  }
}
