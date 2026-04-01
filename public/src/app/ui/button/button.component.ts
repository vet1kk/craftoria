import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';

import { ButtonSize, ButtonVariant } from '../../models';
import { LoaderComponent } from '../loader';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [LoaderComponent, NgClass],
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly loadingLabel = input<string | null>(null);
  readonly reloadable = input(false);
  readonly fullWidth = input(false);
  readonly rounded = input<'default' | 'full'>('default');
  readonly className = input('');
  readonly reloadStateChange = output<boolean>();

  private wasLoading = false;

  constructor() {
    effect(() => {
      const isLoading = this.loading();

      if (this.reloadable() && this.wasLoading && !isLoading) {
        this.reloadStateChange.emit(false);
      }

      this.wasLoading = isLoading;
    });
  }

  isDisabled(): boolean {
    return this.disabled() || this.loading();
  }

  loaderTone(): 'light' | 'dark' {
    return ['primary', 'secondary', 'danger'].includes(this.variant()) ? 'light' : 'dark';
  }

  onClick(): void {
    if (this.reloadable() && !this.isDisabled()) {
      this.reloadStateChange.emit(true);
    }
  }
}
