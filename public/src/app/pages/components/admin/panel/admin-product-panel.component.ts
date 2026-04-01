import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { Category, Product, SkeletonGroupConfig } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services';
import { ImagePreviewComponent, SkeletonComponent } from '../../../../ui';

@Component({
  selector: 'app-admin-product-panel',
  standalone: true,
  imports: [TranslatePipe, SkeletonComponent, ImagePreviewComponent],
  templateUrl: './admin-product-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductPanelComponent {
  private readonly i18n = inject(I18nService);

  readonly products = input.required<Product[]>();
  readonly isLoading = input(false);
  readonly categories = input.required<Category[]>();
  readonly currency = input.required<string>();
  readonly productsSkeletonGroups: SkeletonGroupConfig[] = [
    {
      rowsClassName: 'space-y-3',
      rows: [
        {
          className: 'rounded-xl border border-stone-100 p-4',
          left: {
            lines: [
              { widthClass: 'w-12', heightClass: 'h-12', roundedClass: 'rounded-lg', tone: 'muted' }
            ]
          },
          center: {
            className: 'space-y-2',
            lines: [
              { widthClass: 'w-44', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-60', heightClass: 'h-3', tone: 'muted' }
            ]
          }
        },
        {
          className: 'rounded-xl border border-stone-100 p-4',
          left: {
            lines: [
              { widthClass: 'w-12', heightClass: 'h-12', roundedClass: 'rounded-lg', tone: 'muted' }
            ]
          },
          center: {
            className: 'space-y-2',
            lines: [
              { widthClass: 'w-40', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-56', heightClass: 'h-3', tone: 'muted' }
            ]
          }
        },
        {
          className: 'rounded-xl border border-stone-100 p-4',
          left: {
            lines: [
              { widthClass: 'w-12', heightClass: 'h-12', roundedClass: 'rounded-lg', tone: 'muted' }
            ]
          },
          center: {
            className: 'space-y-2',
            lines: [
              { widthClass: 'w-36', heightClass: 'h-4', tone: 'default' },
              { widthClass: 'w-52', heightClass: 'h-3', tone: 'muted' }
            ]
          }
        }
      ]
    }
  ];
  readonly categoriesById = computed(
    () => new Map(this.categories().map((category) => [category.id, category.name]))
  );

  getCategoryName(categoryId: string): string {
    return this.categoriesById().get(categoryId) ?? this.i18n.translate('ui.admin.unknownCategory');
  }
}
