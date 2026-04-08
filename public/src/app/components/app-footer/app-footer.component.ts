import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './app-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFooterComponent {
  readonly localeService = inject(I18nService);

  setLocale(locale: 'en' | 'ua'): void {
    this.localeService.setLocale(locale);
  }
}
