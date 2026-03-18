import { computed, Injectable, signal } from '@angular/core';

import { CartItem, Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  readonly items = signal<CartItem[]>([]);

  readonly totalCount = computed(() =>
    this.items().reduce((accumulator, item) => accumulator + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce(
      (accumulator, item) => accumulator + item.product.price * item.quantity,
      0
    )
  );

  addToCart(item: Product, notes = ''): void {
    this.items.update((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.product.id === item.id
      );

      if (!existingItem) {
        return [...currentItems, { product: item, quantity: 1, notes }];
      }

      return currentItems.map((cartItem) =>
        cartItem.product.id === item.id
          ? {
            ...cartItem,
            quantity: cartItem.quantity + 1,
            notes: notes || cartItem.notes
          }
          : cartItem
      );
    });
  }

  decreaseQuantity(itemId: string): void {
    this.items.update((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.product.id === itemId
      );

      if (existingItem && existingItem.quantity > 1) {
        return currentItems.map((cartItem) =>
          cartItem.product.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }

      return currentItems.filter((cartItem) => cartItem.product.id !== itemId);
    });
  }

  removeItem(itemId: string): void {
    this.items.update((currentItems) =>
      currentItems.filter((cartItem) => cartItem.product.id !== itemId)
    );
  }

  replaceCart(items: CartItem[]): void {
    this.items.set(items.map((item) => ({ ...item, product: { ...item.product } })));
  }

  clearCart(): void {
    this.items.set([]);
  }
}
