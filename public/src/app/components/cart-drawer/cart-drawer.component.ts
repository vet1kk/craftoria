import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, concatMap, forkJoin, map, of, switchMap, take, throwError } from 'rxjs';

import { OrderRequest } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import {
  AuthApiService,
  AuthService,
  CartDrawerService,
  CartService,
  I18nService,
  OrderApiService,
  SettingsApiService
} from '../../services';
import { extractApiErrorMessage } from '../../services/api-error';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartDrawerComponent {
  readonly cartDrawerService = inject(CartDrawerService);
  readonly cartService = inject(CartService);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  private readonly authApiService = inject(AuthApiService);
  private readonly orderApiService = inject(OrderApiService);
  private readonly settingsApiService = inject(SettingsApiService);
  private readonly i18n = inject(I18nService);
  readonly isSending = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly currency = signal('UAH');
  readonly defaultClientPhone = computed(() => {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === 'client' ? currentUser.phone : '';
  });

  constructor() {
    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency || 'UAH');
    });
    this.clearMessages();
  }

  close(): void {
    this.cartDrawerService.close();
    this.clearMessages();
  }

  placeOrder(phone: string): void {
    const phoneRegex = /^\+?[0-9()\s.-]{10,20}$/;

    if (!phoneRegex.test(phone)) {
      this.errorMessage.set(this.i18n.translate('ui.cart.phoneError'));
      return;
    }

    this.isSending.set(true);
    this.clearMessages();

    const currentUser = this.authService.currentUser();

    this.orderApiService.createOrder({
      customer_name: currentUser?.name ?? null,
      customer_email: currentUser?.email ?? null,
      customer_phone: phone,
      fulfillment_type: 'pickup',
      currency: this.currency(),
      payment_method: 'cash'
    }).pipe(
      concatMap((orderResponse) => {
        const orderId = orderResponse.data?.id;

        if (!orderId) {
          return throwError(() => new Error('Order id is missing in create order response.'));
        }

        const itemRequests = this.buildOrderRequest(phone).items.map((item) => this.orderApiService.createOrderItem(orderId, {
          product_id: item.product.id,
          quantity: item.quantity,
          notes: item.notes?.trim() || null
        }));

        return itemRequests.length > 0 ? forkJoin(itemRequests) : of([]);
      }),
      switchMap(() => {
        if (!currentUser) {
          return of(null);
        }

        return this.authApiService.profile().pipe(
          map((response) => response.data),
          catchError(() => of(null))
        );
      }),
      map((profile) => {
        if (profile) {
          this.authService.setCurrentUser(profile);
        }
      }),
      catchError((error: unknown) => {
        return throwError(() => new Error(extractApiErrorMessage(error, 'Failed to submit the order. Please try again later.', this.i18n)));
      }),
      take(1)
    ).subscribe({
      next: () => {
        this.isSending.set(false);
        this.successMessage.set(this.i18n.translate('ui.cart.success'));
        setTimeout(() => {
          this.close();
          this.clearMessages();
          this.cartService.clearCart();
        }, 4000);
      },
      error: (error: unknown) => {
        this.isSending.set(false);
        this.errorMessage.set(error instanceof Error ? this.i18n.translate(error.message) : this.i18n.translate('ui.cart.orderError'));
      }
    });
  }

  private buildOrderRequest(phone: string): OrderRequest {
    return {
      phone,
      items: this.cartService.items(),
      currency: this.currency(),
      total_price: this.cartService.totalPrice()
    };
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
