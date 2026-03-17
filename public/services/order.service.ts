import { Injectable } from '@angular/core';

import { OrderHistoryItem, OrderRequest } from '../models';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  // TODO(api): Replace this mock order creation with a backend order submission endpoint.
  submitOrder(orderRequest: OrderRequest): Promise<void> {
    const orderHistoryItem: OrderHistoryItem = {
      id: `ORD-${Date.now()}`,
      placedAt: new Date().toISOString(),
      status: 'preparing',
      phone: orderRequest.phone,
      totalPrice: orderRequest.totalPrice,
      currency: orderRequest.currency,
      items: orderRequest.items.map((item) => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: item.menuItem.price
      }))
    };

    this.recordClientOrder(orderHistoryItem);
    return Promise.resolve();
  }

  // TODO(api): Replace this local current-user sync with the backend order response
  // or a follow-up order-history/profile fetch.
  private recordClientOrder(order: OrderHistoryItem): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser || currentUser.role !== 'client') {
      return;
    }

    const updatedUser = this.userService.addOrderToUser(currentUser.id, order);

    if (updatedUser) {
      this.authService.updateCurrentUser(updatedUser);
    }
  }
}
