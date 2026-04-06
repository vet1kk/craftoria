export interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string | null;
  image_url?: string | null;
  position: number;
  is_active: boolean;
  is_system: boolean;
  translations?: Record<string, { name?: string | null }>;
}

export interface CategoryUpsertPayload {
  name: string;
  translations?: Record<string, { name?: string | null }>;
  icon: string | null;
  position: number;
  is_active: boolean;
  image: File | null;
  product_ids: string[];
}

export interface CategoryUpdatePayload extends CategoryUpsertPayload {
  id: string;
}

export interface CategoryProductOption {
  id: string;
  name: string;
  category_id: string | null;
}

export interface CatalogData {
  categories: Category[];
  products: Product[];
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
  ingredient_id?: string;
  product_id?: string;
  quantity: number;
  quantity_label?: string | null;
  position?: number;
  created_at?: string | null;
  updated_at?: string | null;
  ingredient?: Ingredient;
  product?: Product;
  image_url?: string | null;
  nutrition_totals?: NutritionFacts;
  translations?: Record<string, { name?: string | null }>;
}

export interface PackageDetails {
  [key: string]: string | number | undefined;

  packaging?: string;
  contents?: string;
  storage?: string;
  shelf_life?: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  featured_image_url?: string | null;
  images: ProductImage[];
  metadata: Metadata[];
  ingredients: Ingredient[];
  shelf_life?: number | undefined;
  position: number;
  stock_quantity: number;
  reorder_level: number;
  is_active: boolean;
  is_available: boolean;
  nutrition_totals: NutritionFacts;
  created_at?: string | null;
  updated_at?: string | null;
  translations?: Record<string, { name?: string | null; description?: string | null }>;
}

export interface ProductUpsertPayload {
  category_id: string | null;
  name: string;
  translations?: Record<string, { name?: string | null; description?: string | null }>;
  sku: string | null;
  description: string;
  price: number;
  featured_image: File | null;
  shelf_life: number | null;
  position: number;
  stock_quantity: number;
  reorder_level: number;
  is_active: boolean;
  is_available: boolean;
}

export interface ProductUpdatePayload extends ProductUpsertPayload {
  id: string;
}

export interface Metadata {
  id: string;
  product_id: string;
  type: string;
  value: string;
  translations?: Record<string, { value?: string | null }>;
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
