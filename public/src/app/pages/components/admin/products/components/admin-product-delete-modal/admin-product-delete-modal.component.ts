import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { ButtonComponent, LoaderComponent } from '../../../../../../ui';

@Component({
  selector: 'app-admin-product-delete-modal',
  standalone: true,
  imports: [TranslatePipe, LoaderComponent, ButtonComponent],
  templateUrl: './admin-product-delete-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductDeleteModalComponent {
  readonly productName = input.required<string>();
  readonly isBusy = input(false);
  readonly actionError = input('');
  readonly busyActionLabel = input('');

  readonly closeRequested = output<void>();
  readonly deleteRequested = output<void>();
}





