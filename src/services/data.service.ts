import { Injectable } from '@angular/core';

import { AppSettings, Category, Ingredient, MenuItem, User } from '../models';

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

  // TODO(api): Replace mock ingredient catalog with a backend ingredients endpoint.
  ingredientsCatalog: Ingredient[] = [
    {
      id: 'brioche-bun',
      name: 'Булочка бріош',
      unit: 'g',
      nutritionPer100: { calories: 310, proteins: 9, fats: 7, carbs: 52 }
    },
    {
      id: 'angus-beef-patty',
      name: 'Яловичина Angus',
      unit: 'g',
      nutritionPer100: { calories: 250, proteins: 26, fats: 18, carbs: 0 }
    },
    {
      id: 'cheddar',
      name: 'Сир чедер',
      unit: 'g',
      nutritionPer100: { calories: 403, proteins: 25, fats: 33, carbs: 1 }
    },
    {
      id: 'romaine',
      name: 'Салат романо',
      unit: 'g',
      nutritionPer100: { calories: 17, proteins: 1, fats: 0, carbs: 3 }
    },
    {
      id: 'tomato',
      name: 'Томат',
      unit: 'g',
      nutritionPer100: { calories: 18, proteins: 1, fats: 0, carbs: 4 }
    },
    {
      id: 'pickles',
      name: 'Маринований огірок',
      unit: 'g',
      nutritionPer100: { calories: 12, proteins: 1, fats: 0, carbs: 2 }
    },
    {
      id: 'signature-sauce',
      name: 'Фірмовий соус',
      unit: 'g',
      nutritionPer100: { calories: 520, proteins: 1, fats: 55, carbs: 6 }
    },
    {
      id: 'beef-patty',
      name: 'Яловичина',
      unit: 'g',
      nutritionPer100: { calories: 248, proteins: 25, fats: 18, carbs: 0 }
    },
    {
      id: 'swiss-cheese',
      name: 'Сир свіс',
      unit: 'g',
      nutritionPer100: { calories: 380, proteins: 27, fats: 28, carbs: 5 }
    },
    {
      id: 'mushrooms',
      name: 'Печериці',
      unit: 'g',
      nutritionPer100: { calories: 22, proteins: 3, fats: 0, carbs: 3 }
    },
    {
      id: 'truffle-mayo',
      name: 'Трюфельний майонез',
      unit: 'g',
      nutritionPer100: { calories: 680, proteins: 1, fats: 74, carbs: 4 }
    },
    {
      id: 'caramelized-onion',
      name: 'Карамелізована цибуля',
      unit: 'g',
      nutritionPer100: { calories: 120, proteins: 1, fats: 4, carbs: 21 }
    },
    {
      id: 'arugula',
      name: 'Рукола',
      unit: 'g',
      nutritionPer100: { calories: 25, proteins: 3, fats: 1, carbs: 4 }
    },
    {
      id: 'pizza-dough',
      name: 'Тісто тривалої ферментації',
      unit: 'g',
      nutritionPer100: { calories: 220, proteins: 8, fats: 3, carbs: 44 }
    },
    {
      id: 'san-marzano-sauce',
      name: 'Томатний соус San Marzano',
      unit: 'g',
      nutritionPer100: { calories: 45, proteins: 2, fats: 1, carbs: 8 }
    },
    {
      id: 'mozzarella-fior',
      name: 'Моцарела fior di latte',
      unit: 'g',
      nutritionPer100: { calories: 280, proteins: 22, fats: 17, carbs: 3 }
    },
    {
      id: 'basil',
      name: 'Базилік',
      unit: 'g',
      nutritionPer100: { calories: 23, proteins: 3, fats: 1, carbs: 3 }
    },
    {
      id: 'olive-oil',
      name: 'Оливкова олія',
      unit: 'g',
      nutritionPer100: { calories: 884, proteins: 0, fats: 100, carbs: 0 }
    },
    {
      id: 'tomato-sauce',
      name: 'Томатний соус',
      unit: 'g',
      nutritionPer100: { calories: 48, proteins: 2, fats: 1, carbs: 9 }
    },
    {
      id: 'mozzarella',
      name: 'Моцарела',
      unit: 'g',
      nutritionPer100: { calories: 272, proteins: 22, fats: 17, carbs: 3 }
    },
    {
      id: 'pepperoni',
      name: 'Подвійна пепероні',
      unit: 'g',
      nutritionPer100: { calories: 494, proteins: 24, fats: 44, carbs: 2 }
    },
    {
      id: 'hot-honey',
      name: 'Гострий медовий соус',
      unit: 'g',
      nutritionPer100: { calories: 300, proteins: 0, fats: 0, carbs: 75 }
    },
    {
      id: 'oregano',
      name: 'Орегано',
      unit: 'g',
      nutritionPer100: { calories: 265, proteins: 9, fats: 4, carbs: 69 }
    },
    {
      id: 'water',
      name: 'Вода',
      unit: 'ml',
      nutritionPer100: { calories: 0, proteins: 0, fats: 0, carbs: 0 }
    },
    {
      id: 'lemon-juice',
      name: 'Сік лимона',
      unit: 'ml',
      nutritionPer100: { calories: 22, proteins: 0, fats: 0, carbs: 7 }
    },
    {
      id: 'sugar-syrup',
      name: 'Цукровий сироп',
      unit: 'ml',
      nutritionPer100: { calories: 280, proteins: 0, fats: 0, carbs: 70 }
    },
    {
      id: 'mint',
      name: 'М’ята',
      unit: 'g',
      nutritionPer100: { calories: 70, proteins: 4, fats: 1, carbs: 15 }
    },
    {
      id: 'ice',
      name: 'Лід',
      unit: 'g',
      nutritionPer100: { calories: 0, proteins: 0, fats: 0, carbs: 0 }
    },
    {
      id: 'lemon-slices',
      name: 'Часточки лимона',
      unit: 'g',
      nutritionPer100: { calories: 29, proteins: 1, fats: 0, carbs: 9 }
    },
    {
      id: 'dark-chocolate',
      name: 'Темний шоколад',
      unit: 'g',
      nutritionPer100: { calories: 546, proteins: 5, fats: 31, carbs: 61 }
    },
    {
      id: 'butter',
      name: 'Вершкове масло',
      unit: 'g',
      nutritionPer100: { calories: 717, proteins: 1, fats: 81, carbs: 0 }
    },
    {
      id: 'eggs',
      name: 'Яйця',
      unit: 'g',
      nutritionPer100: { calories: 143, proteins: 13, fats: 10, carbs: 1 }
    },
    {
      id: 'flour',
      name: 'Борошно',
      unit: 'g',
      nutritionPer100: { calories: 364, proteins: 10, fats: 1, carbs: 76 }
    },
    {
      id: 'sugar',
      name: 'Цукор',
      unit: 'g',
      nutritionPer100: { calories: 387, proteins: 0, fats: 0, carbs: 100 }
    },
    {
      id: 'vanilla-ice-cream',
      name: 'Ванільне морозиво',
      unit: 'g',
      nutritionPer100: { calories: 207, proteins: 4, fats: 11, carbs: 24 }
    },
    {
      id: 'chocolate-topping',
      name: 'Шоколадний топінг',
      unit: 'g',
      nutritionPer100: { calories: 320, proteins: 2, fats: 3, carbs: 70 }
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
      galleryImageUrls: [
        'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=900&q=80'
      ],
      ingredients: [
        { ingredientId: 'brioche-bun', quantity: 75 },
        { ingredientId: 'angus-beef-patty', quantity: 140 },
        { ingredientId: 'cheddar', quantity: 25 },
        { ingredientId: 'romaine', quantity: 15 },
        { ingredientId: 'tomato', quantity: 25 },
        { ingredientId: 'pickles', quantity: 15 },
        { ingredientId: 'signature-sauce', quantity: 25 }
      ],
      packageDetails: {
        packaging: 'Крафтовий бургер-бокс із вентиляційними отворами та окрема серветка.',
        contents: '1 бургер, фірмовий соус у стіку, паперовий холдер для подачі.',
        storage: 'Найкраще смакує одразу після приготування. Не залишати без холодильника довше 2 годин.',
        shelfLife: 'До 12 годин у холодильнику при температурі +2...+4°C.'
      },
      available: true
    },
    {
      id: '102',
      categoryId: '1',
      name: 'Бургер з трюфелем і грибами',
      description: 'Яловича котлета, сир свіс, трюфельний майонез і карамелізована цибуля.',
      price: 450,
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
      galleryImageUrls: [
        'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80'
      ],
      ingredients: [
        { ingredientId: 'brioche-bun', quantity: 75 },
        { ingredientId: 'beef-patty', quantity: 140 },
        { ingredientId: 'swiss-cheese', quantity: 25 },
        { ingredientId: 'mushrooms', quantity: 40 },
        { ingredientId: 'truffle-mayo', quantity: 20 },
        { ingredientId: 'caramelized-onion', quantity: 25 },
        { ingredientId: 'arugula', quantity: 15 }
      ],
      packageDetails: {
        packaging: 'Щільний бокс із пергаментом, який зберігає текстуру булочки та грибної начинки.',
        contents: '1 бургер, фірмова наліпка-пломба, паперова серветка.',
        storage: 'Рекомендуємо спожити протягом 25 хвилин після отримання.',
        shelfLife: 'До 10 годин у холодильнику при температурі +2...+4°C.'
      },
      available: true
    },
    {
      id: '201',
      categoryId: '2',
      name: 'Піца Маргарита',
      description: 'Томатний соус San Marzano, свіжа моцарела та базилік.',
      price: 370,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      galleryImageUrls: [
        'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1548365328-9f547fb0953b?auto=format&fit=crop&w=900&q=80'
      ],
      ingredients: [
        { ingredientId: 'pizza-dough', quantity: 280 },
        { ingredientId: 'san-marzano-sauce', quantity: 90 },
        { ingredientId: 'mozzarella-fior', quantity: 130 },
        { ingredientId: 'basil', quantity: 5 },
        { ingredientId: 'olive-oil', quantity: 15 }
      ],
      servingDetails: 'Формат: 30 см',
      packageDetails: {
        packaging: 'Класична картонна коробка 32 см з термостійкою вкладкою.',
        contents: '1 піца, соус у контейнері, серветки.',
        storage: 'Тримати коробку горизонтально. Після відкриття спожити протягом 2 годин.',
        shelfLife: 'До 18 годин у холодильнику при температурі +2...+4°C.'
      },
      available: true
    },
    {
      id: '202',
      categoryId: '2',
      name: 'Пепероні Фест',
      description: 'Подвійна пепероні, моцарела та гострий медовий соус.',
      price: 360,
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80',
      galleryImageUrls: [
        'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=900&q=80'
      ],
      ingredients: [
        { ingredientId: 'pizza-dough', quantity: 270 },
        { ingredientId: 'tomato-sauce', quantity: 80 },
        { ingredientId: 'mozzarella', quantity: 120 },
        { ingredientId: 'pepperoni', quantity: 55 },
        { ingredientId: 'hot-honey', quantity: 10 },
        { ingredientId: 'oregano', quantity: 5 }
      ],
      servingDetails: 'Формат: 30 см',
      packageDetails: {
        packaging: 'Щільна коробка для піци з перфорованими отворами для виходу пари.',
        contents: '1 піца, гострий медовий соус, серветки.',
        storage: 'Спожити протягом 2 годин або охолодити відразу після отримання.',
        shelfLife: 'До 18 годин у холодильнику при температурі +2...+4°C.'
      },
      available: true
    },
    {
      id: '301',
      categoryId: '3',
      name: 'Авторський лимонад',
      description: 'Свіжовичавлені лимони з легкою ноткою м’яти.',
      price: 70,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
      galleryImageUrls: [
        'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1523371683702-7f0f0d6f4f5a?auto=format&fit=crop&w=900&q=80'
      ],
      ingredients: [
        { ingredientId: 'water', quantity: 220 },
        { ingredientId: 'lemon-juice', quantity: 70 },
        { ingredientId: 'sugar-syrup', quantity: 30 },
        { ingredientId: 'mint', quantity: 10 },
        { ingredientId: 'ice', quantity: 50 },
        { ingredientId: 'lemon-slices', quantity: 20 }
      ],
      packageDetails: {
        packaging: 'Прозорий стакан 500 мл із пласкою кришкою та паперовою трубочкою.',
        contents: '400 мл лимонаду, лід, часточки лимона та м’ята.',
        storage: 'Вживати охолодженим. Після отримання не залишати при кімнатній температурі довше 1 години.',
        shelfLife: 'До 8 годин у холодильнику без льоду.'
      },
      available: true
    },
    {
      id: '401',
      categoryId: '4',
      name: 'Шоколадний лава-кейк',
      description: 'Теплий шоколадний кекс із рідкою серединкою та ванільним морозивом.',
      price: 35,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
      galleryImageUrls: [
        'https://images.unsplash.com/photo-1617305855058-336dcb5efc46?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80'
      ],
      ingredients: [
        { ingredientId: 'dark-chocolate', quantity: 25 },
        { ingredientId: 'butter', quantity: 10 },
        { ingredientId: 'eggs', quantity: 20 },
        { ingredientId: 'flour', quantity: 10 },
        { ingredientId: 'sugar', quantity: 10 },
        { ingredientId: 'vanilla-ice-cream', quantity: 50 },
        { ingredientId: 'chocolate-topping', quantity: 25 }
      ],
      packageDetails: {
        packaging: 'Десертний контейнер з окремим відсіком для морозива та дерев’яна ложечка.',
        contents: '1 лава-кейк, кулька ванільного морозива, шоколадний топінг.',
        storage: 'Подавати одразу. Якщо охолодили, перед подачею прогріти 20–25 секунд.',
        shelfLife: 'До 12 годин у холодильнику без морозива.'
      },
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
