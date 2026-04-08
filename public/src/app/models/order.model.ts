import { Product } from './catalog.model';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type FulfillmentType = 'pickup' | 'delivery';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  currency: string;
  subtotal_amount: number;
  discount_amount: number;
  delivery_fee_amount: number;
  total_amount: number;
  customer_notes?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  payment_reference?: string | null;
  delivery_address?: DeliveryAddress;
  placed_at?: string | null;
  confirmed_at?: string | null;
  preparing_at?: string | null;
  estimated_ready_at?: string | null;
  ready_at?: string | null;
  paid_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancelled_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  items?: OrderItem[];
}

export interface DeliveryAddress {
  line_1: string;
  line_2?: string | null;
  city: string;
  postal_code: string;
  country_code: string;
}

export interface OrderRequest {
  phone: string;
  items: CartItem[];
  currency: string;
  total_price: number;
}

export interface CreateOrderPayload {
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string;
  fulfillment_type: 'pickup';
  currency: string;
  payment_method: 'cash';
}

export interface CreateOrderItemPayload {
  product_id: string;
  quantity: number;
  notes: string | null;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes?: string | null;
}