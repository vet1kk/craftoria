import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { AdminTab } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { ButtonComponent } from '../../../../ui';

@Component({
  selector: 'app-admin-tabs',
  standalone: true,
  imports: [TranslatePipe, ButtonComponent],
  templateUrl: './admin-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTabsComponent {
  readonly activeTab = input.required<AdminTab>();
  readonly isReloading = input(false);
  readonly tabChange = output<AdminTab>();
  readonly reloadStateChange = output<boolean>();
}
