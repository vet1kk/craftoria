import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { take } from 'rxjs';

import { CatalogHelper } from '../../helpers';
import { AdminTab, Category, Product } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SettingsApiService } from '../../services';
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
  private readonly settingsApiService = inject(SettingsApiService);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isCatalogLoading = signal(false);
  readonly catalogError = signal('');
  readonly currency = signal('');

  readonly activeTab = signal<AdminTab>('items');
  readonly editableCategories = computed(() =>
    this.categories().filter((category) => category.slug !== 'all')
  );

  constructor() {
    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency);
    });

    this.catalogHelper.loadCatalogIntoState(this.categories, this.products, this.isCatalogLoading, this.catalogError);
  }
}
