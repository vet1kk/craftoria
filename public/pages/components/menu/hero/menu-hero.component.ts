import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-menu-hero',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './menu-hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuHeroComponent {}
