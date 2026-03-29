import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'orange' | 'sky';

@Component({
  selector: 'ui-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
}
