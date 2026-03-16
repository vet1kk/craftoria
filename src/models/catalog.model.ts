export interface AppSettings {
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  imageUrl: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
}
