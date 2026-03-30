import { inject, Injectable } from '@angular/core';

import { Category, Ingredient, IngredientUnit, Product, } from '../models';
import { DataService } from './data.service';
import { I18nService } from './i18n.service';
import { catchError, map, Observable, of } from 'rxjs';
import { extractApiErrorMessage } from './api-error';
import { ProductApiService } from './product-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly dataService = inject(DataService);
  private readonly productApiService = inject(ProductApiService);
  private readonly i18n = inject(I18nService);

  getCategoryById(categoryId: string): Category | undefined {
    return this.dataService.categories().find((category) => category.id === categoryId);
  }

  getProductIngredientBreakdown(product: Product): Ingredient[] {
    return product.ingredients.map((ingredient: Ingredient) => {
      return {
        ...ingredient,
        quantity_label: this.formatQuantity(ingredient.quantity, ingredient.unit),
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

  loadProduct(slug: string): Observable<Product | undefined> {
    return this.productApiService.item(slug).pipe(
      map((response) => response.data),
      catchError((error: unknown) => {
        this.dataService.catalogError.set(extractApiErrorMessage(error, this.i18n.translate('ui.products.itemLoadError'), this.i18n));

        return of(undefined);
      })
    );
  }
}
