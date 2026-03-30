import { Order } from './order.model';

export type UserRole = 'admin' | 'client';
export type AuthMode = 'login' | 'register';
export type LoginControlName = 'email' | 'password';
export type RegistrationControlName = 'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at?: string | null;
  orders?: Order[];
}

export interface ClientRegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthActionResult {
  success: boolean;
  message?: string;
}