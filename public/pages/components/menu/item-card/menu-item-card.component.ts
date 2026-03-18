import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { MenuItem } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService, MenuService } from '../../../../services';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './menu-item-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuItemCardComponent {
  readonly menuService = inject(MenuService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly item = input.required<MenuItem>();
  readonly currency = input.required<string>();
  readonly addToCart = output<MenuItem>();
  readonly portionLabel = computed(() => this.menuService.getMenuItemPortionLabel(this.item()));
  readonly itemAriaLabel = computed(() => `${this.i18n.translate('ui.itemCard.openDetailsFor')} ${this.item().name}`);
  readonly hasImage = computed(() => {
    const imageUrl = this.item().imageUrl;
    return Boolean(imageUrl) && !imageUrl?.startsWith('data:image/svg+xml');
  });

  openDetails(): void {
    void this.router.navigate(['/item', this.item().slug]);
  }
}
