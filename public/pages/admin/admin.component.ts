import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AdminTab } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { DataService } from '../../services';
import { AdminCategoriesPanelComponent, AdminMenuItemsPanelComponent, AdminTabsComponent } from '../components';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [AdminTabsComponent, AdminMenuItemsPanelComponent, AdminCategoriesPanelComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent {
  readonly dataService = inject(DataService);

  readonly activeTab = signal<AdminTab>('items');
  readonly editableCategories = computed(() =>
    this.dataService.categories().filter((category) => category.slug !== 'all')
  );

  constructor() {
    void this.dataService.ensureCatalogLoaded();
  }
}
