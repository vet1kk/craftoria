import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [NgClass],
  templateUrl: './modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  readonly open = input(false);
  readonly disableClose = input(false);
  readonly maxWidth = input<'md' | 'lg' | 'xl' | '2xl'>('2xl');

  readonly closeRequested = output<void>();

  maxWidthClass(): string {
    switch (this.maxWidth()) {
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      default:
        return 'max-w-2xl';
    }
  }

  onBackdropClick(): void {
    if (this.disableClose()) {
      return;
    }

    this.closeRequested.emit();
  }
}
