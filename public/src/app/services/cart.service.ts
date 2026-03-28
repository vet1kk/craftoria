import { computed, inject, Injectable, signal } from '@angular/core';

import { CartItem, Product } from '../models';
import { ToastService } from './toast.service';
import { I18nService } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  readonly items = signal<CartItem[]>([]);
  readonly toastsService = inject(ToastService);
  readonly i18n = inject(I18nService);

  readonly totalCount = computed(() =>
    this.items().reduce((accumulator, item) => accumulator + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce(
      (accumulator, item) => accumulator + item.product.price * item.quantity,
      0
    )
  );

  addToCart(product: Product, notes = ''): void {
    this.items.update((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.product.id === product.id
      );

      if (!existingItem) {
        this.toastsService.success(this.i18n.translate('ui.toast.addedToCart', { name: product.name }));
        return [...currentItems, { product: product, quantity: 1, notes }];
      }

      this.toastsService.success(this.i18n.translate('ui.toast.addedToCart', { name: product.name }));
      return currentItems.map((cartItem) =>
        cartItem.product.id === product.id
          ? {
            ...cartItem,
            quantity: cartItem.quantity + 1,
            notes: notes || cartItem.notes
          }
          : cartItem
      );
    });
  }

  decreaseQuantity(productId: string): void {
    this.items.update((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.product.id === productId
      );

      if (existingItem && existingItem.quantity > 1) {
        this.toastsService.success(this.i18n.translate('ui.toast.removedFromCart', { name: existingItem.product.name }));
        return currentItems.map((cartItem) =>
          cartItem.product.id === productId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else if (existingItem) {
        this.toastsService.success(this.i18n.translate('ui.toast.removedFromCart', { name: existingItem.product.name }));
      }

      return currentItems.filter((cartItem) => cartItem.product.id !== productId);
    });
  }

  removeProduct(productId: string): void {
    this.items.update((currentItems) => {
      const item = currentItems.find(i => i.product.id === productId);
      if (item) {
        this.toastsService.success(
          this.i18n.translate('ui.toast.removedFromCart', {
            name: item.product.name
          })
        );
        return currentItems.filter(i => i.product.id !== productId);
      }
      return currentItems;
    });
  }

  replaceCart(items: CartItem[]): void {
    this.items.set(items.map((item) => ({ ...item, product: { ...item.product } })));
    if (items.length > 0) {
      this.toastsService.success(this.i18n.translate('ui.toast.cartReplaced'));
    }
  }

  clearCart(): void {
    this.items.set([]);
  }
}
