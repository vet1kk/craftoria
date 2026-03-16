import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { AdminTab } from '../../models';
import { DataService } from '../../services';
import { AdminCategoriesPanelComponent, AdminMenuItemsPanelComponent, AdminTabsComponent } from '../components';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [AdminTabsComponent, AdminMenuItemsPanelComponent, AdminCategoriesPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent {
  readonly dataService = inject(DataService);

  readonly activeTab = signal<AdminTab>('items');
  readonly backendNotice =
    'Редагування з адмін-панелі тимчасово недоступне. Меню, категорії та обробка замовлень керуватимуться майбутнім backend API.';
}
