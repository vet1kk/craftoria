import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocaleService } from '../../services';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './app-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFooterComponent {
  readonly localeService = inject(LocaleService);

  setLocale(locale: 'en' | 'ua'): void {
    this.localeService.setLocale(locale);
  }
}
