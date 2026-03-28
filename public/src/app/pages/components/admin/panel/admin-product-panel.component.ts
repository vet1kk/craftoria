import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { Category, Product } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services';

@Component({
  selector: 'app-admin-product-panel',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './admin-product-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductPanelComponent {
  private readonly i18n = inject(I18nService);

  readonly products = input.required<Product[]>();
  readonly categories = input.required<Category[]>();
  readonly currency = input.required<string>();
  readonly categoriesById = computed(
    () => new Map(this.categories().map((category) => [category.id, category.name]))
  );

  getCategoryName(categoryId: string): string {
    return this.categoriesById().get(categoryId) ?? this.i18n.translate('ui.admin.unknownCategory');
  }
}
