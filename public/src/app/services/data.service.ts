import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiCollectionResponse, Category, Product } from '../models';
import { environment } from '../../environments/environment';
import { extractApiErrorMessage } from './api-error';
import { I18nService } from './i18n.service';
import { LocaleService } from './locale.service';
import { AppSettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);
  private readonly localeService = inject(LocaleService);
  private readonly settingsService = inject(AppSettingsService);
  private catalogRequest: Promise<void> | null = null;
  lastLoadedLocale: string | null = null;

  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly catalogError = signal('');
  readonly appSettings = signal({ currency: '' });

  constructor() {
    effect(() => {
      this.settingsService.settings().then((settings) => {
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

  async ensureCatalogLoaded(force = false): Promise<void> {
    if (!force && this.categories().length > 0 && this.products().length > 0) {
      return;
    }

    if (this.catalogRequest) {
      return this.catalogRequest;
    }

    this.isCatalogLoading.set(true);
    this.catalogError.set('');

    this.catalogRequest = Promise
      .all([
        firstValueFrom(this.http.get<ApiCollectionResponse<Category>>(`${environment.apiUrl}/categories`)),
        firstValueFrom(this.http.get<ApiCollectionResponse<Product>>(`${environment.apiUrl}/products`))
      ])
      .then(([categoriesResponse, productsResponse]) => {
        const categories = categoriesResponse.data ?? [];
        const products = productsResponse.data ?? [];

        this.categories.set(categories);
        this.products.set(products);
      })
      .catch((error: unknown) => {
        this.catalogError.set(extractApiErrorMessage(error, this.i18n.translate('ui.products.catalogLoadError'), this.i18n));
        throw error;
      })
      .finally(() => {
        this.isCatalogLoading.set(false);
        this.catalogRequest = null;
      });

    return this.catalogRequest;
  }
}

