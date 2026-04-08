import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { User } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services';

@Component({
  selector: 'app-account-profile-summary',
  standalone: true,
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './account-profile-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountProfileSummaryComponent {
  private readonly i18n = inject(I18nService);
  readonly user = input.required<User>();
  readonly isAdmin = input.required<boolean>();
  readonly ordersCount = input(0);

  getRoleLabel(role: 'admin' | 'client'): string {
    return role === 'admin'
      ? this.i18n.translate('ui.profile.roleAdmin')
      : this.i18n.translate('ui.profile.roleClient');
  }
}
