import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { MenuItem } from '../../../../models';
import { MenuService } from '../../../../services';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './menu-item-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuItemCardComponent {
  readonly menuService = inject(MenuService);
  private readonly router = inject(Router);
  readonly item = input.required<MenuItem>();
  readonly currency = input.required<string>();
  readonly addToCart = output<MenuItem>();
  readonly portionLabel = computed(() => this.menuService.getMenuItemPortionLabel(this.item()));

  openDetails(): void {
    void this.router.navigate(['/item', this.item().id]);
  }
}
