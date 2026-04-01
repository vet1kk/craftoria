export interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string | null;
  image_url?: string | null;
  position: number;
  is_active: boolean;
}

export interface CategoryUpsertPayload {
  name: string;
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

export interface ProductUpsertPayload {
  category_id: string;
  name: string;
  sku: string | null;
  description: string;
  price: number;
  featured_image: File | null;
  shelf_life: string | null;
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
