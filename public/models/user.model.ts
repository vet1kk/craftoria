import { OrderHistoryItem } from './order.model';

export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  joinedAt: string;
  orders: OrderHistoryItem[];
}

export interface ClientRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}
