import { ChangeDetectionStrategy, Component, computed, EventEmitter, input, Output } from '@angular/core';

import { Category, CategoryProductOption } from '../../../../../../models';
import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { ButtonComponent, ImagePreviewComponent } from '../../../../../../ui';

@Component({
  selector: 'app-admin-category-view-modal',
  standalone: true,
  imports: [TranslatePipe, ImagePreviewComponent, ButtonComponent],
  templateUrl: './admin-category-view-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoryViewModalComponent {
  readonly category = input.required<Category>();
  readonly productOptions = input.required<CategoryProductOption[]>();
  readonly assignedProductNames = computed<string[]>(() => this.productOptions()
    .filter((option) => option.category_id === this.category().id)
    .map((option) => option.name));

  @Output() readonly closeRequested = new EventEmitter<void>();
  @Output() readonly editRequested = new EventEmitter<void>();
  @Output() readonly deleteRequested = new EventEmitter<void>();
}
