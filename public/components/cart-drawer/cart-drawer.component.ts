import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { OrderRequest } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService, CartDrawerService, CartService, DataService, I18nService, OrderService } from '../../services';

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
  readonly dataService = inject(DataService);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly i18n = inject(I18nService);
  readonly isSending = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly defaultClientPhone = computed(() => {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === 'client' ? currentUser.phone : '';
  });

  constructor() {
    this.clearMessages();
  }

  close(): void {
    this.cartDrawerService.close();
    this.clearMessages();
  }

  async placeOrder(phone: string): Promise<void> {
    const phoneRegex = /^\+?[0-9()\s.-]{10,20}$/;

    if (!phoneRegex.test(phone)) {
      this.errorMessage.set(this.i18n.translate('ui.cart.phoneError'));
      return;
    }

    this.isSending.set(true);
    this.clearMessages();

    try {
      await this.orderService.submitOrder(this.buildOrderRequest(phone));
      this.isSending.set(false);
      this.successMessage.set(this.i18n.translate('ui.cart.success'));
      setTimeout(() => {
        this.close();
        this.clearMessages();
        this.cartService.clearCart();
      }, 4000);
    } catch (error: unknown) {
      this.isSending.set(false);
      this.errorMessage.set(error instanceof Error ? this.i18n.translate(error.message) : this.i18n.translate('ui.cart.orderError'));
    }
  }

  private buildOrderRequest(phone: string): OrderRequest {
    return {
      phone,
      items: this.cartService.items(),
      currency: this.dataService.appSettings.currency,
      totalPrice: this.cartService.totalPrice()
    };
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
