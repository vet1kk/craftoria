export interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string | null;
  image_url?: string | null;
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
  name: string;
  slug: string;
  unit: IngredientUnit;
  quantity: number;
  position: number;
  nutrition_totals: NutritionFacts;
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
  [key: string]: string | undefined;

  packaging?: string;
  contents?: string;
  storage?: string;
  shelf_life?: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  featured_image_url?: string | null;
  images: ProductImage[];
  metadata: Metadata[];
  ingredients: Ingredient[];
  shelf_life?: string | undefined;
  position: number;
  stock_quantity: number;
  reorder_level: number;
  is_active: boolean;
  is_available: boolean;
  nutrition_totals: NutritionFacts;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Metadata {
  id: string;
  product_id: string;
  type: string;
  value: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  position: number;
  created_at?: string | null;
  updated_at?: string | null;
}
