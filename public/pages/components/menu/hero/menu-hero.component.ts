import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-menu-hero',
  standalone: true,
  templateUrl: './menu-hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuHeroComponent {}
