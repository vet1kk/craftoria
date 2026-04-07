import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Product } from '../../../../../../models';
import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { ButtonComponent, ImagePreviewComponent } from '../../../../../../ui';

@Component({
  selector: 'app-admin-product-view-modal',
  standalone: true,
  imports: [TranslatePipe, ButtonComponent, ImagePreviewComponent],
  templateUrl: './admin-product-view-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductViewModalComponent {
  readonly product = input.required<Product>();
  readonly categoryName = input.required<string>();

  readonly closeRequested = output<void>();
  readonly editRequested = output<void>();
  readonly deleteRequested = output<void>();
}
