import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PackageDetails } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-product-packaging',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './product-packaging.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductPackagingComponent {
  readonly packageDetails = input.required<PackageDetails>();
}
