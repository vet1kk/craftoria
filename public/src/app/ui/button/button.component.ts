import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonSize, ButtonVariant } from '../../models';

@Component({
  selector: 'ui-button',
  standalone: true,
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly rounded = input<'default' | 'full'>('default');
}
