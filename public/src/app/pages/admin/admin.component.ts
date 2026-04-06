import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { CatalogHelper } from '../../helpers';
import { AdminTab, Category, CategoryProductOption, Product } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CategoryApiService, I18nService, SettingsApiService, UserService } from '../../services';
import { AdminCategoriesPanelComponent, AdminProductPanelComponent, AdminTabsComponent } from '../components';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [AdminTabsComponent, AdminProductPanelComponent, AdminCategoriesPanelComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent {
  private readonly catalogHelper = inject(CatalogHelper);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly settingsApiService = inject(SettingsApiService);
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly i18n = inject(I18nService);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly isRefreshing = signal(false);
  readonly catalogError = signal('');
  readonly currency = signal('');
  readonly categoryProductOptions = signal<CategoryProductOption[]>([]);
  private readonly isRedirecting = signal(false);
  private lastLoadedLocale: string | null = null;

  readonly activeTab = signal<AdminTab>('items');
  readonly assignableCategories = computed(() =>
    this.categories().filter((category) => !category.is_system)
  );
  readonly editableCategories = computed(() =>
    this.assignableCategories()
  );

  constructor() {
    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency);
    });

    this.reloadCatalog();
    this.reloadCategoryOptions();

    effect(() => {
      if (this.isRefreshing() && !this.isCatalogLoading()) {
        this.isRefreshing.set(false);
      }
    });

    effect(() => {
      if (this.isRedirecting()) {
        return;
      }

      if (this.userService.isAdmin()) {
        return;
      }

      this.isRedirecting.set(true);
      void this.router.navigate(['/products'], { replaceUrl: true });
    });

    effect(() => {
      const locale = this.i18n.locale();
      const shouldForceReload = this.lastLoadedLocale !== null && this.lastLoadedLocale !== locale;
      this.lastLoadedLocale = locale;

      if (shouldForceReload) {
        this.reloadCatalog();
        this.reloadCategoryOptions();
      }
    });
  }

  onCategoryChanged(): void {
    this.reloadCatalog();
    this.reloadCategoryOptions();
  }

  refreshPage(): void {
    if (this.isCatalogLoading()) {
      return;
    }

    this.isRefreshing.set(true);
    this.reloadCatalog();
    this.reloadCategoryOptions();
  }

  onRefreshStateChange(isRefreshing: boolean): void {
    if (!isRefreshing) {
      this.isRefreshing.set(false);
      return;
    }

    this.refreshPage();
  }

  private reloadCatalog(): void {
    this.catalogHelper.loadCatalogIntoState(this.categories, this.products, this.isCatalogLoading, this.catalogError);
  }

  private reloadCategoryOptions(): void {
    this.categoryApiService.options().pipe(take(1)).subscribe({
      next: (response) => {
        this.categoryProductOptions.set(response.data ?? []);
      },
    });
  }
}
