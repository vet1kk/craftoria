import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-products-hero',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './products-hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsHeroComponent {}
