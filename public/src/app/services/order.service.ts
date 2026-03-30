import { inject, Injectable } from '@angular/core';
import { catchError, concatMap, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';

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

    return this.orderApiService.createOrder({
      customer_name: currentUser?.name ?? null,
      customer_email: currentUser?.email ?? null,
      customer_phone: orderRequest.phone,
      fulfillment_type: 'pickup',
      currency: 'UAH',
      payment_method: 'cash'
    }).pipe(
      concatMap((orderResponse) => {
        const orderId = orderResponse.data?.id;

        if (!orderId) {
          return throwError(() => new Error('Order id is missing in create order response.'));
        }

        const itemRequests = orderRequest.items.map((item) => this.orderApiService.createOrderItem(orderId, {
          product_id: item.product.id,
          quantity: item.quantity,
          notes: item.notes?.trim() || null
        }));

        if (itemRequests.length === 0) {
          return of(void 0);
        }

        return forkJoin(itemRequests).pipe(map(() => void 0));
      }),
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
