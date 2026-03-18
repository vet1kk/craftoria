import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppFooterComponent, AppHeaderComponent, CartDrawerComponent, ToastContainerComponent } from './components';
import { AnalyticsService } from './services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent, AppFooterComponent, CartDrawerComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly analyticsService = inject(AnalyticsService);

  constructor() {
    void this.analyticsService;
  }
}
