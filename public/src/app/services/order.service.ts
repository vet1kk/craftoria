import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';

import { OrderRequest } from '../models';
import { extractApiErrorMessage } from './api-error';
import { AuthService } from './auth.service';
import { I18nService } from './i18n.service';
import { OrderApiService } from './order-api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly orderApiService = inject(OrderApiService);
  private readonly authService = inject(AuthService);
  private readonly i18n = inject(I18nService);

  submitOrder(orderRequest: OrderRequest): Observable<void> {
    const currentUser = this.authService.currentUser();

    return this.orderApiService.submit({
      customer_name: currentUser?.name ?? null,
      customer_email: currentUser?.email ?? null,
      customer_phone: orderRequest.phone,
      fulfillment_type: 'pickup',
      currency: 'UAH',
      payment_method: 'cash',
      items: orderRequest.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        notes: item.notes?.trim() || null
      }))
    }).pipe(
      switchMap(() => {
        if (!currentUser) {
          return of(void 0);
        }

        return this.authService.refreshProfile().pipe(
          catchError(() => of(null)),
          map(() => void 0)
        );
      }),
      catchError((error: unknown) => {
        return throwError(() => new Error(extractApiErrorMessage(error, 'Failed to submit the order. Please try again later.', this.i18n)));
      })
    );
  }
}
