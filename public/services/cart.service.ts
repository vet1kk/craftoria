import { computed, inject, Injectable, signal } from '@angular/core';

import { CartItem, MenuItem } from '../models';
import { I18nService } from './i18n.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly toastService = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly items = signal<CartItem[]>([]);

  readonly totalCount = computed(() =>
    this.items().reduce((accumulator, item) => accumulator + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce(
      (accumulator, item) => accumulator + item.menuItem.price * item.quantity,
      0
    )
  );

  addToCart(item: MenuItem, notes = ''): void {
    this.items.update((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.menuItem.id === item.id
      );

      if (!existingItem) {
        return [...currentItems, { menuItem: item, quantity: 1, notes }];
      }

      return currentItems.map((cartItem) =>
        cartItem.menuItem.id === item.id
          ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
              notes: notes || cartItem.notes
            }
          : cartItem
      );
    });

    this.toastService.success(this.i18n.translate('ui.toast.addedToCart', { name: item.name }));
  }

  decreaseQuantity(itemId: string): void {
    this.items.update((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.menuItem.id === itemId
      );

      if (existingItem && existingItem.quantity > 1) {
        return currentItems.map((cartItem) =>
          cartItem.menuItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }

      return currentItems.filter((cartItem) => cartItem.menuItem.id !== itemId);
    });
  }

  removeItem(itemId: string): void {
    this.items.update((currentItems) =>
      currentItems.filter((cartItem) => cartItem.menuItem.id !== itemId)
    );
  }

  replaceCart(items: CartItem[]): void {
    this.items.set(items.map((item) => ({ ...item, menuItem: { ...item.menuItem } })));
  }

  clearCart(): void {
    this.items.set([]);
  }
}
