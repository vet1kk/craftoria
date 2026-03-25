import { inject, Injectable } from '@angular/core';

import { ApiResourceResponse, Category, Ingredient, IngredientUnit, Product, ResolvedProductIngredient } from '../models';
import { DataService } from './data.service';
import { I18nService } from './i18n.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { extractApiErrorMessage } from './api-error';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly dataService = inject(DataService);
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);

  getCategoryById(categoryId: string): Category | undefined {
    return this.dataService.categories().find((category) => category.id === categoryId);
  }

  getProductIngredientBreakdown(product: Product): ResolvedProductIngredient[] {
    return product.ingredients.map((ingredient: Ingredient) => {
      return {
        ingredient,
        quantity: ingredient.quantity,
        quantity_label: this.formatQuantity(ingredient.quantity, ingredient.unit),
        nutrition: ingredient.nutrition_totals
      };
    });
  }

  getProductPortionLabel(product: Product): string {
    const totalsByUnit = product.ingredients.reduce<Record<IngredientUnit, number>>(
      (accumulator, ingredient: Ingredient) => {
        accumulator[ingredient.unit] += ingredient.quantity;

        return accumulator;
      },
      { g: 0, ml: 0 }
    );

    const portionLabel = (Object.entries(totalsByUnit) as Array<[IngredientUnit, number]>)
      .filter(([, total]) => total > 0)
      .map(([unit, total]) => this.formatQuantity(total, unit))
      .join(' + ');

    return portionLabel || 'Порція уточнюється';
  }

  private formatQuantity(quantity: number, unit: IngredientUnit): string {
    const formattedQuantity = Number.isInteger(quantity) ? quantity.toString() : quantity.toFixed(1);

    return `${formattedQuantity} ${this.i18n.translate('ui.itemDetail.' + unit)}`;
  }

  async loadProduct(slug: string): Promise<Product | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResourceResponse<Product>>(`${environment.apiBaseUrl}/products/${slug}`)
      );
      return response.data;
    } catch (error: unknown) {
      this.dataService.catalogError.set(extractApiErrorMessage(error, this.i18n.translate('ui.products.itemLoadError'), this.i18n));

      return undefined;
    }
  }
}
