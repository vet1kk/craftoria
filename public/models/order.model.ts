import { MenuItem } from './catalog.model';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderLineItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string;
}

export interface OrderHistoryItem {
  id: string;
  orderId: string;
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
