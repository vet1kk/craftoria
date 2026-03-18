import { Injectable } from '@angular/core';

import { Order, OrderLineItem, OrderStatus, User } from '../models';

export interface ApiOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes?: string | null;
}

interface ApiOrder {
  id: string;
  order_number: string;
  status: string;
  customer_phone?: string | null;
  currency: string;
  total_amount: number;
  placed_at?: string | null;
  created_at?: string | null;
  items?: ApiOrderItem[];
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'client';
  created_at?: string | null;
  orders?: ApiOrder[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  mapUser(user: ApiUser): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at ?? new Date().toISOString(),
      orders: [...(user.orders ?? [])]
        .map((order) => this.mapOrder(order))
        .sort((left, right) => Date.parse(right.placed_at) - Date.parse(left.placed_at))
    };
  }

  private mapOrder(order: ApiOrder): Order {
    return {
      id: order.order_number,
      order_id: order.id,
      placed_at: order.placed_at ?? order.created_at ?? new Date().toISOString(),
      status: this.normalizeOrderStatus(order.status),
      phone: order.customer_phone ?? 'Самовивіз',
      total_price: order.total_amount,
      currency: this.formatCurrency(order.currency),
      items: (order.items ?? []).map((item) => this.mapOrderItem(item))
    };
  }

  private mapOrderItem(item: ApiOrderItem): OrderLineItem {
    return {
      id: item.id,
      product_id: item.product_id,
      name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
      notes: item.notes ?? undefined
    };
  }

  private normalizeOrderStatus(status: string): OrderStatus {
    switch (status) {
      case 'confirmed':
      case 'preparing':
      case 'ready':
      case 'delivered':
      case 'cancelled':
        return status;
      default:
        return 'pending';
    }
  }

  private formatCurrency(currencyCode: string): string {
    return currencyCode === 'UAH' ? 'грн' : currencyCode;
  }
}
