import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Category } from '../../../../models';

@Component({
  selector: 'app-admin-categories-panel',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './admin-categories-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoriesPanelComponent {
  readonly categories = input.required<Category[]>();
}
