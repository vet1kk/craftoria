import { Injectable } from '@angular/core';

import { AppSettings, Category, MenuItem, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // TODO(api): Replace mock categories with a backend catalog/categories endpoint.
  categories: Category[] = [
    {
      id: '1',
      name: 'Бургери',
      icon: '🍔',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=320&q=80'
    },
    {
      id: '2',
      name: 'Піца',
      icon: '🍕',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=320&q=80'
    },
    {
      id: '3',
      name: 'Напої',
      icon: '🥤',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=320&q=80'
    },
    {
      id: '4',
      name: 'Десерти',
      icon: '🍰',
      imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=320&q=80'
    }
  ];

  // TODO(api): Replace mock menu items with a backend catalog/menu-items endpoint.
  menuItems: MenuItem[] = [
    {
      id: '101',
      categoryId: '1',
      name: 'Класичний чізбургер',
      description: 'Котлета з яловичини Angus, сир чедер, салат, томат і фірмовий соус.',
      price: 400,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
      available: true
    },
    {
      id: '102',
      categoryId: '1',
      name: 'Бургер з трюфелем і грибами',
      description: 'Яловича котлета, сир свіс, трюфельний майонез і карамелізована цибуля.',
      price: 450,
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
      available: true
    },
    {
      id: '201',
      categoryId: '2',
      name: 'Піца Маргарита',
      description: 'Томатний соус San Marzano, свіжа моцарела та базилік.',
      price: 370,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      available: true
    },
    {
      id: '202',
      categoryId: '2',
      name: 'Пепероні Фест',
      description: 'Подвійна пепероні, моцарела та гострий медовий соус.',
      price: 360,
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80',
      available: true
    },
    {
      id: '301',
      categoryId: '3',
      name: 'Авторський лимонад',
      description: 'Свіжовичавлені лимони з легкою ноткою м’яти.',
      price: 70,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
      available: true
    },
    {
      id: '401',
      categoryId: '4',
      name: 'Шоколадний лава-кейк',
      description: 'Теплий шоколадний кекс із рідкою серединкою та ванільним морозивом.',
      price: 35,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
      available: true
    }
  ];

  // TODO(api): Replace mock app settings with a backend public settings/config endpoint.
  appSettings: AppSettings = {
    currency: 'грн'
  };

  // TODO(api): Remove seeded mock users after auth/profile/order history data is loaded from backend APIs.
  users: User[] = [
    {
      id: 'admin-1',
      fullName: 'Олена Адмін',
      email: 'admin@craftoria.test',
      password: 'admin123',
      phone: '+380 50 111 2233',
      role: 'admin',
      joinedAt: '2024-04-12T10:00:00Z',
      orders: []
    },
    {
      id: 'client-1',
      fullName: 'Ігор Клієнт',
      email: 'ihor@craftoria.test',
      password: 'client123',
      phone: '+380 67 555 8899',
      role: 'client',
      joinedAt: '2025-08-02T08:15:00Z',
      orders: [
        {
          id: 'ORD-1048',
          placedAt: '2026-03-12T18:05:00Z',
          status: 'delivered',
          phone: '+380 67 555 8899',
          totalPrice: 830,
          currency: 'грн',
          items: [
            { id: '102', name: 'Truffle Mushroom Burger', quantity: 1, unitPrice: 450 },
            { id: '301', name: 'Artisan Lemonade', quantity: 2, unitPrice: 70 },
            { id: '401', name: 'Chocolate Lava Cake', quantity: 3, unitPrice: 35 }
          ]
        },
        {
          id: 'ORD-1056',
          placedAt: '2026-03-14T13:20:00Z',
          status: 'preparing',
          phone: '+380 67 555 8899',
          totalPrice: 740,
          currency: 'грн',
          items: [
            { id: '201', name: 'Margherita Pizza', quantity: 1, unitPrice: 370 },
            { id: '202', name: 'Pepperoni Feast', quantity: 1, unitPrice: 360 }
          ]
        },
        {
          id: 'ORD-1057',
          placedAt: '2026-03-15T13:20:00Z',
          status: 'preparing',
          phone: '+380 67 555 8899',
          totalPrice: 740,
          currency: 'грн',
          items: [
            { id: '201', name: 'Margherita Pizza', quantity: 1, unitPrice: 370 },
            { id: '202', name: 'Pepperoni Feast', quantity: 1, unitPrice: 360 },
            { id: '401', name: 'Chocolate Lava Cake', quantity: 3, unitPrice: 35 }
          ]
        }
      ]
    },
    {
      id: 'client-2',
      fullName: 'Софія Гість',
      email: 'sofiia@craftoria.test',
      password: 'guest123',
      phone: '+380 93 210 4455',
      role: 'client',
      joinedAt: '2025-11-19T15:45:00Z',
      orders: [
        {
          id: 'ORD-1009',
          placedAt: '2026-03-08T09:10:00Z',
          status: 'cancelled',
          phone: '+380 93 210 4455',
          totalPrice: 470,
          currency: 'грн',
          items: [
            { id: '101', name: 'Classic Cheeseburger', quantity: 1, unitPrice: 400 },
            { id: '301', name: 'Artisan Lemonade', quantity: 1, unitPrice: 70 }
          ]
        }
      ]
    }
  ];
}
