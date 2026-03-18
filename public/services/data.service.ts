import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AppSettings, Category, Ingredient, IngredientUnit, MenuItem, NutritionFacts } from '../models';
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

const CATEGORY_IMAGE_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#f5f5f4"/><text x="160" y="105" text-anchor="middle" fill="#78716c" font-family="Arial, sans-serif" font-size="18">Craftoria</text></svg>'
)}`;

const PRODUCT_IMAGE_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="900" height="600" fill="#f5f5f4"/><text x="450" y="315" text-anchor="middle" fill="#78716c" font-family="Arial, sans-serif" font-size="44">Craftoria</text></svg>'
)}`;

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
  readonly menuItems = signal<MenuItem[]>([]);
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
    if (!force && this.categories().length > 0 && this.menuItems().length > 0) {
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
        this.setMenuItems(mappedProducts);
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

  async loadMenuItem(slug: string): Promise<MenuItem | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResourceResponse<ApiProduct>>(`${environment.apiBaseUrl}/products/${slug}`)
      );
      const product = response.data;
      const mappedProduct = this.mapProduct(product);

      this.upsertMenuItem(mappedProduct);
      this.mergeIngredients(product.ingredients ?? []);

      return mappedProduct;
    } catch (error: unknown) {
      if (this.menuItems().length === 0) {
        this.catalogError.set(extractApiErrorMessage(error, this.i18n.translate('ui.menu.itemLoadError'), this.i18n));
      }

      return null;
    }
  }

  private setMenuItems(items: MenuItem[]): void {
    const currentLocale = this.localeService.apiLocale();
    const sortedItems = [...items].sort((left, right) => left.name.localeCompare(right.name, currentLocale));
    this.menuItems.set(sortedItems);
  }

  private upsertMenuItem(item: MenuItem): void {
    const nextItems = [...this.menuItems()];
    const existingIndex = nextItems.findIndex((currentItem) => currentItem.id === item.id);

    if (existingIndex === -1) {
      nextItems.push(item);
    } else {
      nextItems[existingIndex] = item;
    }

    this.setMenuItems(nextItems);
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
      imageUrl: this.sanitizeImageUrl(category.image_url, CATEGORY_IMAGE_PLACEHOLDER),
      position: category.position,
      isActive: category.is_active
    };
  }

  private mapIngredient(ingredient: ApiIngredient): Ingredient {
    return {
      id: ingredient.id,
      slug: ingredient.slug,
      name: ingredient.name,
      unit: this.normalizeIngredientUnit(ingredient.unit),
      position: ingredient.position,
      nutritionPer100: ingredient.nutrition_per_100
    };
  }

  private mapProduct(product: ApiProduct): MenuItem {
    const metadata = this.normalizeMetadata(product.metadata);
    const galleryImageUrls = [...new Set([
      product.featured_image_url,
      ...(product.gallery_image_urls ?? [])
    ]
      .map((imageUrl) => this.sanitizeImageUrl(imageUrl, PRODUCT_IMAGE_PLACEHOLDER))
      .filter((imageUrl, index, allImages) => Boolean(imageUrl) && allImages.indexOf(imageUrl) === index))];
    const mappedIngredients = [...(product.ingredients ?? [])]
      .sort((left, right) => left.position - right.position)
      .map((ingredient) => ({
        ingredientId: ingredient.id,
        quantity: ingredient.quantity,
        position: ingredient.position
      }));

    this.mergeIngredients(product.ingredients ?? []);

    return {
      id: product.id,
      slug: product.slug,
      sku: product.sku?.trim() || '',
      categoryId: product.category_id,
      name: product.name,
      description: product.description?.trim() || this.i18n.translate('ui.data.descriptionPlaceholder'),
      price: product.price,
      imageUrl: this.sanitizeImageUrl(product.featured_image_url, galleryImageUrls[0] || PRODUCT_IMAGE_PLACEHOLDER),
      galleryImageUrls: galleryImageUrls.length > 0 ? galleryImageUrls : [PRODUCT_IMAGE_PLACEHOLDER],
      ingredients: mappedIngredients,
      servingDetails: metadata['serving_details']?.trim() || undefined,
      packageDetails: {
        packaging: metadata['packaging']?.trim() || this.i18n.translate('ui.data.packagingPlaceholder'),
        contents: metadata['contents']?.trim() || this.buildContentsLabel(product.ingredients ?? []),
        storage: metadata['storage_instructions']?.trim() || this.i18n.translate('ui.data.storagePlaceholder'),
        shelfLife: metadata['shelf_life']?.trim() || product.shelf_life?.trim() || this.i18n.translate('ui.data.shelfLifePlaceholder')
      },
      nutritionTotals: product.nutrition_totals,
      available: product.is_active && product.is_available,
      isActive: product.is_active,
      stockQuantity: product.stock_quantity,
      reorderLevel: product.reorder_level,
      shelfLife: product.shelf_life?.trim() || undefined
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

  private sanitizeImageUrl(imageUrl: string | null | undefined, fallbackUrl: string): string {
    const trimmedImageUrl = imageUrl?.trim();

    if (!trimmedImageUrl) {
      return fallbackUrl;
    }

    if (trimmedImageUrl.startsWith('data:image/')) {
      return trimmedImageUrl;
    }

    try {
      const parsedUrl = new URL(trimmedImageUrl, 'http://localhost');

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return fallbackUrl;
      }

      if (BLOCKED_IMAGE_HOSTS.has(parsedUrl.hostname)) {
        return fallbackUrl;
      }

      return trimmedImageUrl;
    } catch {
      return fallbackUrl;
    }
  }
}
