export interface AppSettings {
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  imageUrl: string;
}

export interface NutritionFacts {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export type IngredientUnit = 'g' | 'ml';

export interface Ingredient {
  id: string;
  name: string;
  unit: IngredientUnit;
  nutritionPer100: NutritionFacts;
}

export interface MenuItemIngredient {
  ingredientId: string;
  quantity: number;
}

export interface ResolvedMenuItemIngredient {
  ingredient: Ingredient;
  quantity: number;
  quantityLabel: string;
  nutrition: NutritionFacts;
}

export interface PackageDetails {
  packaging: string;
  contents: string;
  storage: string;
  shelfLife: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  galleryImageUrls: string[];
  ingredients: MenuItemIngredient[];
  servingDetails?: string;
  packageDetails: PackageDetails;
  available: boolean;
}
