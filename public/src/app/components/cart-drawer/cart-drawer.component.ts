import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, concatMap, forkJoin, map, of, switchMap, take, throwError } from 'rxjs';

import { ApiErrorHelper } from '../../helpers';
import { OrderRequest } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import {
  AuthApiService,
  CartDrawerService,
  CartService,
  I18nService,
  OrderApiService,
  SettingsApiService,
  UserService
} from '../../services';
import { ButtonComponent, FormInputComponent } from '../../ui';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [DecimalPipe, TranslatePipe, ReactiveFormsModule, FormInputComponent, ButtonComponent],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartDrawerComponent {
  readonly cartDrawerService = inject(CartDrawerService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  readonly cartService = inject(CartService);
  readonly router = inject(Router);
  readonly authService = inject(UserService);
  private readonly authApiService = inject(AuthApiService);
  private readonly orderApiService = inject(OrderApiService);
  private readonly settingsApiService = inject(SettingsApiService);
  private readonly i18n = inject(I18nService);
  readonly isSending = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly currency = signal('UAH');
  readonly phoneControl = new FormControl('', { nonNullable: true });
  readonly defaultClientPhone = computed(() => {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === 'client' ? currentUser.phone : '';
  });

  constructor() {
    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency || 'UAH');
    });

    effect(() => {
      const phone = this.defaultClientPhone();

      if (phone && !this.phoneControl.dirty) {
        this.phoneControl.setValue(phone);
      }
    });

    this.clearMessages();
  }

  close(): void {
    this.cartDrawerService.close();
    this.clearMessages();
  }

  placeOrder(): void {
    const phone = this.phoneControl.value.trim();
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
        return throwError(() => new Error(this.apiErrorHelper.extractApiErrorMessage(error, 'Failed to submit the order. Please try again later.')));
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
