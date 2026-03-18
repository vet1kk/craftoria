export interface AppSettings {
  currency: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  image_url: string | null;
  position: number;
  is_active: boolean;
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
  quantity: number;
  position: number;
  nutrition_per_100: NutritionFacts;
}

export interface ProductIngredient {
  ingredient_id: string;
  quantity: number;
  position: number;
}

export interface ResolvedProductIngredient {
  ingredient: Ingredient;
  quantity: number;
  quantity_label: string;
  nutrition: NutritionFacts;
}

export interface PackageDetails {
  packaging: string;
  contents: string;
  storage: string;
  shelf_life: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  gallery_image_urls: string[];
  ingredients: ProductIngredient[];
  serving_details?: string;
  package_details: PackageDetails;
  nutrition_totals?: NutritionFacts;
  available: boolean;
  is_active: boolean;
  stock_quantity: number;
  reorder_level: number;
  shelf_life?: string;
}
