import { effect, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, forkJoin, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';

import { Category, Product } from '../models';
import { extractApiErrorMessage } from './api-error';
import { CategoryApiService } from './category.service';
import { I18nService } from './i18n.service';
import { LocaleService } from './locale.service';
import { ProductApiService } from './product-api.service';
import { SettingsApiService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly categoryService = inject(CategoryApiService);
  private readonly productApiService = inject(ProductApiService);
  private readonly i18n = inject(I18nService);
  private readonly localeService = inject(LocaleService);
  private readonly settingsService = inject(SettingsApiService);
  private catalogRequest$: Observable<void> | null = null;
  lastLoadedLocale: string | null = null;

  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly catalogError = signal('');
  readonly appSettings = signal({ currency: '' });

  constructor() {
    effect(() => {
      this.settingsService.settings().subscribe((settings) => {
        this.appSettings.set(settings.data);
      });
    });
  }

  shouldReloadCatalogForLocale(): boolean {
    const locale = this.localeService.locale();
    const shouldForceReload = this.lastLoadedLocale !== null && this.lastLoadedLocale !== locale;

    this.lastLoadedLocale = locale;

    return shouldForceReload;
  }

  ensureCatalogLoaded(force = false): Observable<void> {
    if (!force && this.categories().length > 0 && this.products().length > 0) {
      return of(void 0);
    }

    if (this.catalogRequest$) {
      return this.catalogRequest$;
    }

    this.isCatalogLoading.set(true);
    this.catalogError.set('');

    this.catalogRequest$ = forkJoin([
      this.categoryService.listing(),
      this.productApiService.listing()
    ]).pipe(
      tap(([categoriesResponse, productsResponse]) => {
        const categories = (categoriesResponse.data ?? []).filter((category) => Boolean(category?.id));
        const products = (productsResponse.data ?? []).filter((product) => Boolean(product?.id));

        this.categories.set(categories);
        this.products.set(products);
      })
      ,
      map(() => void 0),
      catchError((error: unknown) => {
        this.catalogError.set(extractApiErrorMessage(error, this.i18n.translate('ui.products.catalogLoadError'), this.i18n));
        return throwError(() => error);
      })
      ,
      finalize(() => {
        this.isCatalogLoading.set(false);
        this.catalogRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.catalogRequest$;
  }
}

