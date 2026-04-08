import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

import { LocalizationHelper } from '../helpers';
import { enTranslations } from '../i18n/en';
import { UiLocale } from '../models';
import { uaTranslations } from '../i18n/ua';


@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly locale = signal<UiLocale>(LocalizationHelper.readInitialLocale(isPlatformBrowser(this.platformId)));
  readonly apiLocale = computed(() => LocalizationHelper.toApiLocale(this.locale()));
  private readonly dictionaries = {
    en: enTranslations,
    ua: uaTranslations
  } as const;

  setLocale(locale: UiLocale): void {
    if (this.locale() === locale) {
      return;
    }

    this.locale.set(locale);
    LocalizationHelper.persistLocale(locale, isPlatformBrowser(this.platformId));
  }

  translate(key: string, params?: Record<string, string> | string): string {
    const fallback = typeof params === 'string' ? params : undefined;
    const interpolationParams = typeof params === 'object' ? params : undefined;

    const localizedValue = LocalizationHelper.readDictionaryValue(this.dictionaries[this.locale()], key);

    if (typeof localizedValue === 'string') {
      return LocalizationHelper.interpolate(localizedValue, interpolationParams);
    }

    const englishValue = LocalizationHelper.readDictionaryValue(this.dictionaries.en, key);

    if (typeof englishValue === 'string') {
      return LocalizationHelper.interpolate(englishValue, interpolationParams);
    }

    return fallback ?? key;
  }
}
