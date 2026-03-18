import { Order } from './order.model';

export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
  orders: Order[];
}

export interface ClientRegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
}
