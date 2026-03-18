import { Product } from './catalog.model';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderLineItem {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes?: string;
}

export interface Order {
  id: string;
  order_id: string;
  placed_at: string;
  status: OrderStatus;
  phone: string;
  total_price: number;
  currency: string;
  items: OrderLineItem[];
}

export interface OrderRequest {
  phone: string;
  items: CartItem[];
  currency: string;
  total_price: number;
}
