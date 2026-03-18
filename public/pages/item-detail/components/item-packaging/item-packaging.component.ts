import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PackageDetails } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-item-packaging',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './item-packaging.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemPackagingComponent {
  readonly packageDetails = input.required<PackageDetails>();
}
