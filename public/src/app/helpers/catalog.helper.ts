import { inject, Injectable, WritableSignal } from '@angular/core';
import { catchError, finalize, of, take } from 'rxjs';

import { Category, Product } from '../models';
import { CatalogApiService, I18nService } from '../services';
import { ApiErrorHelper } from './api-error.helper';

@Injectable({
  providedIn: 'root'
})
export class CatalogHelper {
  private readonly catalogApiService = inject(CatalogApiService);
  private readonly i18n = inject(I18nService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);

  loadCatalogIntoState(
    categories: WritableSignal<Category[]>,
    products: WritableSignal<Product[]>,
    isCatalogLoading: WritableSignal<boolean>,
    catalogError: WritableSignal<string>
  ): void {
    isCatalogLoading.set(true);
    catalogError.set('');

    this.catalogApiService.loadCatalog().pipe(
      take(1),
      catchError((error: unknown) => {
        catalogError.set(
          this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.products.catalogLoadError'))
        );
        return of(null);
      }),
      finalize(() => isCatalogLoading.set(false))
    ).subscribe((result) => {
      if (!result) {
        return;
      }

      categories.set(result.categories);
      products.set(result.products);
    });
  }
}
