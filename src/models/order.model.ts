import { MenuItem } from './catalog.model';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'delivered' | 'preparing' | 'cancelled';

export interface OrderLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderHistoryItem {
  id: string;
  placedAt: string;
  status: OrderStatus;
  phone: string;
  totalPrice: number;
  currency: string;
  items: OrderLineItem[];
}

export interface OrderRequest {
  phone: string;
  items: CartItem[];
  currency: string;
  totalPrice: number;
}
