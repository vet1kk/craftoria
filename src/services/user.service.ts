import { Injectable } from '@angular/core';

import { ClientRegistrationData, OrderHistoryItem, OrderLineItem, User } from '../models';
import { DataService } from './data.service';

// TODO(api): Remove this localStorage fallback once user/auth/order data comes from backend endpoints.
const USERS_STORAGE_KEY = 'craftoria.mock-users';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly users: User[];

  constructor(private readonly dataService: DataService) {
    this.users = this.loadUsers();
  }

  // TODO(api): This local credential search is temporary until AuthService uses a backend login endpoint.
  findUserByCredentials(email: string, password: string): User | null {
    const normalizedEmail = this.normalizeEmail(email);
    const matchedUser = this.users.find((user) => this.normalizeEmail(user.email) === normalizedEmail && user.password === password);

    if (!matchedUser) {
      return null;
    }

    return this.copyUser(matchedUser);
  }

  // TODO(api): Replace local user creation with the backend registration endpoint.
  createClientUser(registrationData: ClientRegistrationData): User {
    const normalizedEmail = this.normalizeEmail(registrationData.email);
    const normalizedPhone = registrationData.phone.trim();

    if (this.hasUserWithEmail(normalizedEmail)) {
      throw new Error('Обліковий запис із таким email вже існує.');
    }

    const createdUser: User = {
      id: `client-${Date.now()}`,
      fullName: registrationData.fullName.trim(),
      email: normalizedEmail,
      password: registrationData.password,
      phone: normalizedPhone,
      role: 'client',
      joinedAt: new Date().toISOString(),
      orders: []
    };

    this.users.push(createdUser);
    this.persistUsers();

    return this.copyUser(createdUser);
  }

  // TODO(api): Replace this local order-history mutation with a backend user/profile or order-history update flow.
  addOrderToUser(userId: string, order: OrderHistoryItem): User | null {
    const userIndex = this.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return null;
    }

    const updatedUser: User = {
      ...this.users[userIndex],
      orders: [this.copyOrder(order), ...this.users[userIndex].orders.map((existingOrder) => this.copyOrder(existingOrder))]
    };

    this.users[userIndex] = updatedUser;
    this.persistUsers();

    return this.copyUser(updatedUser);
  }

  private loadUsers(): User[] {
    const storedUsers = this.readStoredUsers();

    if (!storedUsers) {
      return this.getSeedUsers();
    }

    return this.localizeUsers(storedUsers);
  }

  // TODO(api): Delete this localStorage reader after switching to backend-backed persistence.
  private readStoredUsers(): User[] | null {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);

    if (!storedUsers) {
      return null;
    }

    try {
      return JSON.parse(storedUsers) as User[];
    } catch {
      return null;
    }
  }

  // TODO(api): Delete this localStorage writer after switching to backend-backed persistence.
  private persistUsers(): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
  }

  // TODO(api): Replace seeded mock users with a backend "current user/users" data source where needed.
  private getSeedUsers(): User[] {
    return this.copyUsers(this.dataService.users);
  }

  private copyUsers(users: readonly User[]): User[] {
    return users.map((user) => this.copyUser(user));
  }

  private copyUser(user: User): User {
    return {
      ...user,
      orders: user.orders.map((order) => this.copyOrder(order))
    };
  }

  private copyOrder(order: OrderHistoryItem): OrderHistoryItem {
    return {
      ...order,
      items: order.items.map((item: OrderLineItem) => ({ ...item }))
    };
  }

  // TODO(api): Remove this migration/localization shim once stored user/order payloads
  // already come from localized backend responses.
  private localizeUsers(users: readonly User[]): User[] {
    const defaultUsersById = new Map(this.dataService.users.map((user) => [user.id, user]));
    const menuItemsById = new Map(this.dataService.menuItems.map((item) => [item.id, item]));

    return this.copyUsers(users).map((user) => {
      const localizedDefaultUser = defaultUsersById.get(user.id);
      const localizedOrders = user.orders.map((order) => ({
        ...order,
        phone: order.phone === 'Pickup counter' ? 'Самовивіз' : order.phone,
        items: order.items.map((item) => ({
          ...item,
          name: menuItemsById.get(item.id)?.name ?? item.name
        }))
      }));

      if (!localizedDefaultUser) {
        return {
          ...user,
          orders: localizedOrders
        };
      }

      return {
        ...user,
        fullName: localizedDefaultUser.fullName,
        orders: localizedOrders
      };
    });
  }

  private hasUserWithEmail(email: string): boolean {
    return this.users.some((user) => this.normalizeEmail(user.email) === email);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
