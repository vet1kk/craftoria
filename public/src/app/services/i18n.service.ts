import { inject, Injectable } from '@angular/core';

import { enTranslations } from '../i18n/en';
import { uaTranslations } from '../i18n/ua';
import { LocaleService } from './locale.service';

interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly localeService = inject(LocaleService);
  private readonly dictionaries = {
    en: enTranslations,
    ua: uaTranslations
  } as const;

  translate(key: string, params?: Record<string, string> | string): string {
    const fallback = typeof params === 'string' ? params : undefined;
    const interpolationParams = typeof params === 'object' ? params : undefined;

    const localizedValue = this.readDictionaryValue(this.dictionaries[this.localeService.locale()], key);

    if (typeof localizedValue === 'string') {
      return this.interpolate(localizedValue, interpolationParams);
    }

    const englishValue = this.readDictionaryValue(this.dictionaries.en, key);

    if (typeof englishValue === 'string') {
      return this.interpolate(englishValue, interpolationParams);
    }

    return fallback ?? key;
  }

  private interpolate(template: string, params?: Record<string, string>): string {
    if (!params) {
      return template;
    }

    return template.replace(/\{\{(\w+)}}/g, (_, paramKey) => params[paramKey] ?? `{{${paramKey}}}`);
  }

  private readDictionaryValue(dictionary: TranslationDictionary, key: string): string | TranslationDictionary | undefined {
    return key.split('.').reduce<string | TranslationDictionary | undefined>((currentValue, segment) => {
      if (currentValue === undefined || typeof currentValue === 'string') {
        return undefined;
      }

      return currentValue[segment];
    }, dictionary);
  }
}
