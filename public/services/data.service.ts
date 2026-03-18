import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AppSettings, Category, Ingredient, IngredientUnit, NutritionFacts, Product } from '../models';
import { environment } from '../environments/environment';
import { extractApiErrorMessage } from './api-error';
import { I18nService } from './i18n.service';
import { LocaleService } from './locale.service';

interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  icon?: string | null;
  image_url?: string | null;
  position: number;
  is_active: boolean;
}

interface ApiIngredient {
  id: string;
  slug: string;
  name: string;
  unit: string;
  quantity: number;
  position: number;
  nutrition_per_100: NutritionFacts;
}

interface ApiProduct {
  id: string;
  category_id: string;
  slug: string;
  sku?: string | null;
  name: string;
  description?: string | null;
  price: number;
  featured_image_url?: string | null;
  gallery_image_urls?: string[];
  metadata?: Array<{
    type: string;
    value: string;
  }> | Record<string, string>;
  ingredients?: ApiIngredient[];
  shelf_life?: string | null;
  stock_quantity: number;
  reorder_level: number;
  is_active: boolean;
  is_available: boolean;
  nutrition_totals?: NutritionFacts;
}

interface ApiCollectionResponse<T> {
  data: T[];
}

interface ApiResourceResponse<T> {
  data: T;
}

const BLOCKED_IMAGE_HOSTS = new Set([
  'via.placeholder.com',
  'placehold.it',
  'placehold.co',
  'lorempixel.com'
]);

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);
  private readonly localeService = inject(LocaleService);
  private catalogRequest: Promise<void> | null = null;
  private lastLoadedLocale: string | null = null;

  readonly categories = signal<Category[]>([]);
  readonly ingredientsCatalog = signal<Ingredient[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly catalogError = signal('');
  readonly appSettings: AppSettings = {
    currency: 'грн'
  };

  constructor() {
    effect(() => {
      const locale = this.localeService.locale();
      const shouldForceReload = this.lastLoadedLocale !== null && this.lastLoadedLocale !== locale;

      this.lastLoadedLocale = locale;

      void this.ensureCatalogLoaded(shouldForceReload);
    });
  }

  async ensureCatalogLoaded(force = false): Promise<void> {
    if (!force && this.categories().length > 0 && this.products().length > 0) {
      return;
    }

    if (this.catalogRequest) {
      return this.catalogRequest;
    }

    this.isCatalogLoading.set(true);
    this.catalogError.set('');

    this.catalogRequest = Promise.all([
      firstValueFrom(this.http.get<ApiCollectionResponse<ApiCategory>>(`${environment.apiBaseUrl}/categories`)),
      firstValueFrom(this.http.get<ApiCollectionResponse<ApiProduct>>(`${environment.apiBaseUrl}/products`))
    ])
      .then(([categoriesResponse, productsResponse]) => {
        const categories = categoriesResponse.data ?? [];
        const products = productsResponse.data ?? [];

        const mappedCategories = categories
          .map((category) => this.mapCategory(category))
          .sort((left, right) => left.position - right.position);
        const mappedProducts = products.map((product) => this.mapProduct(product));

        this.categories.set(mappedCategories);
        this.setProducts(mappedProducts);
      })
      .catch((error: unknown) => {
        this.catalogError.set(extractApiErrorMessage(error, this.i18n.translate('ui.menu.catalogLoadError'), this.i18n));
        throw error;
      })
      .finally(() => {
        this.isCatalogLoading.set(false);
        this.catalogRequest = null;
      });

    return this.catalogRequest;
  }

  async loadProduct(slug: string): Promise<Product | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResourceResponse<ApiProduct>>(`${environment.apiBaseUrl}/products/${slug}`)
      );
      const product = response.data;
      const mappedProduct = this.mapProduct(product);

      this.upsertProduct(mappedProduct);
      this.mergeIngredients(product.ingredients ?? []);

      return mappedProduct;
    } catch (error: unknown) {
      if (this.products().length === 0) {
        this.catalogError.set(extractApiErrorMessage(error, this.i18n.translate('ui.menu.itemLoadError'), this.i18n));
      }

      return null;
    }
  }

  private setProducts(items: Product[]): void {
    const currentLocale = this.localeService.apiLocale();
    const sortedItems = [...items].sort((left, right) => left.name.localeCompare(right.name, currentLocale));
    this.products.set(sortedItems);
  }

  private upsertProduct(item: Product): void {
    const nextItems = [...this.products()];
    const existingIndex = nextItems.findIndex((currentItem) => currentItem.id === item.id);

    if (existingIndex === -1) {
      nextItems.push(item);
    } else {
      nextItems[existingIndex] = item;
    }

    this.setProducts(nextItems);
  }

  private mergeIngredients(ingredients: ApiIngredient[]): void {
    const ingredientMap = new Map(this.ingredientsCatalog().map((ingredient) => [ingredient.id, ingredient]));

    for (const ingredient of ingredients) {
      ingredientMap.set(ingredient.id, this.mapIngredient(ingredient));
    }

    this.ingredientsCatalog.set(
      [...ingredientMap.values()].sort((left, right) => {
        if (left.position === right.position) {
          return left.name.localeCompare(right.name, this.localeService.apiLocale());
        }

        return left.position - right.position;
      })
    );
  }

  private mapCategory(category: ApiCategory): Category {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      icon: category.icon?.trim() || '🍽️',
      image_url: this.sanitizeImageUrl(category.image_url),
      position: category.position,
      is_active: category.is_active
    };
  }

  private mapIngredient(ingredient: ApiIngredient): Ingredient {
    return {
      id: ingredient.id,
      slug: ingredient.slug,
      name: ingredient.name,
      unit: this.normalizeIngredientUnit(ingredient.unit),
      quantity: ingredient.quantity,
      position: ingredient.position,
      nutrition_per_100: ingredient.nutrition_per_100
    };
  }

  private mapProduct(product: ApiProduct): Product {
    const metadata = this.normalizeMetadata(product.metadata);
    const gallery_image_urls = [
      product.featured_image_url,
      ...(product.gallery_image_urls ?? [])
    ]
      .map((imageUrl) => this.sanitizeImageUrl(imageUrl))
      .filter((imageUrl): imageUrl is string => imageUrl !== null)
      .filter((imageUrl, index, allImages) => allImages.indexOf(imageUrl) === index);
    const mappedIngredients = [...(product.ingredients ?? [])]
      .sort((left, right) => left.position - right.position)
      .map((ingredient) => ({
        ingredient_id: ingredient.id,
        quantity: ingredient.quantity,
        position: ingredient.position
      }));

    this.mergeIngredients(product.ingredients ?? []);

    return {
      id: product.id,
      slug: product.slug,
      sku: product.sku?.trim() || '',
      category_id: product.category_id,
      name: product.name,
      description: product.description?.trim() || this.i18n.translate('ui.data.descriptionPlaceholder'),
      price: product.price,
      image_url: this.sanitizeImageUrl(product.featured_image_url) ?? gallery_image_urls[0] ?? null,
      gallery_image_urls,
      ingredients: mappedIngredients,
      serving_details: metadata['serving_details']?.trim() || undefined,
      package_details: {
        packaging: metadata['packaging']?.trim() || this.i18n.translate('ui.data.packagingPlaceholder'),
        contents: metadata['contents']?.trim() || this.buildContentsLabel(product.ingredients ?? []),
        storage: metadata['storage_instructions']?.trim() || this.i18n.translate('ui.data.storagePlaceholder'),
        shelf_life: metadata['shelf_life']?.trim() || product.shelf_life?.trim() || this.i18n.translate('ui.data.shelfLifePlaceholder')
      },
      nutrition_totals: product.nutrition_totals,
      available: product.is_active && product.is_available,
      is_active: product.is_active,
      stock_quantity: product.stock_quantity,
      reorder_level: product.reorder_level,
      shelf_life: product.shelf_life?.trim() || undefined
    };
  }

  private buildContentsLabel(ingredients: ApiIngredient[]): string {
    if (ingredients.length === 0) {
      return this.i18n.translate('ui.data.contentsPlaceholder');
    }

    return ingredients
      .sort((left, right) => left.position - right.position)
      .map((ingredient) => ingredient.name)
      .join(', ');
  }

  private normalizeIngredientUnit(unit: string): IngredientUnit {
    return unit === 'ml' ? 'ml' : 'g';
  }

  /**
   * Accept both the legacy metadata array shape and the current keyed object shape.
   */
  private normalizeMetadata(
    metadata: ApiProduct['metadata']
  ): Record<string, string> {
    if (!metadata) {
      return {};
    }

    if (Array.isArray(metadata)) {
      return metadata.reduce<Record<string, string>>((accumulator, entry) => {
        if (!entry?.type) {
          return accumulator;
        }

        accumulator[entry.type] = entry.value ?? '';

        return accumulator;
      }, {});
    }

    return metadata;
  }

  private sanitizeImageUrl(imageUrl: string | null | undefined): string | null {
    const trimmedImageUrl = imageUrl?.trim();

    if (!trimmedImageUrl) {
      return null;
    }

    if (trimmedImageUrl.startsWith('data:image/')) {
      return trimmedImageUrl;
    }

    try {
      const parsedUrl = new URL(trimmedImageUrl, 'http://localhost');

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return null;
      }

      if (BLOCKED_IMAGE_HOSTS.has(parsedUrl.hostname)) {
        return null;
      }

      return trimmedImageUrl;
    } catch {
      return null;
    }
  }
}
