import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { AdminTab } from '../../../../models';

@Component({
  selector: 'app-admin-tabs',
  standalone: true,
  templateUrl: './admin-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTabsComponent {
  readonly activeTab = input.required<AdminTab>();
  readonly tabChange = output<AdminTab>();
}
