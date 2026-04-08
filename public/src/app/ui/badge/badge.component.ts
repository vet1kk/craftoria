import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeVariant } from '../../models';

@Component({
  selector: 'ui-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
}
