export interface AppSettings {
  currency: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  imageUrl: string | null;
  position: number;
  isActive: boolean;
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
  slug: string;
  name: string;
  unit: IngredientUnit;
  position: number;
  nutritionPer100: NutritionFacts;
}

export interface MenuItemIngredient {
  ingredientId: string;
  quantity: number;
  position: number;
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
  slug: string;
  sku: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  galleryImageUrls: string[];
  ingredients: MenuItemIngredient[];
  servingDetails?: string;
  packageDetails: PackageDetails;
  nutritionTotals?: NutritionFacts;
  available: boolean;
  isActive: boolean;
  stockQuantity: number;
  reorderLevel: number;
  shelfLife?: string;
}
