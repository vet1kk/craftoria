import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { MenuItem } from '../../../../models';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './menu-item-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuItemCardComponent {
  readonly item = input.required<MenuItem>();
  readonly currency = input.required<string>();
  readonly addToCart = output<MenuItem>();
}
