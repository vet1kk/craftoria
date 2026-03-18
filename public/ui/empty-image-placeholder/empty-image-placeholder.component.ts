import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { NgClass } from '@angular/common';

export type PlaceholderSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-empty-image',
  standalone: true,
  imports: [TranslatePipe, NgClass],
  templateUrl: './empty-image-placeholder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyImagePlaceholderComponent {
  readonly size = input<PlaceholderSize>('md');
  readonly showLabel = input(true);
  readonly labelKey = input('ui.itemDetail.emptySlot');
}
