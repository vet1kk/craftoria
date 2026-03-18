import { Pipe, PipeTransform, inject } from '@angular/core';

import { I18nService } from '../services';

@Pipe({
  name: 't',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private readonly i18nService = inject(I18nService);

  transform(key: string, fallback?: string): string {
    return this.i18nService.translate(key, fallback);
  }
}
