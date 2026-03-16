import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { User } from '../../../../models';

@Component({
  selector: 'app-account-profile-summary',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './account-profile-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountProfileSummaryComponent {
  readonly user = input.required<User>();
  readonly isAdmin = input.required<boolean>();

  getRoleLabel(role: 'admin' | 'client'): string {
    return role === 'admin' ? 'Адміністратор' : 'Клієнт';
  }
}
