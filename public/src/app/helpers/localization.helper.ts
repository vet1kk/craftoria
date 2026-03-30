import { TranslationDictionary, UiLocale } from '../models';

const LOCALE_STORAGE_KEY = 'craftoria.locale';

export class LocalizationHelper {
  static toApiLocale(locale: UiLocale): 'en' | 'uk' {
    return locale === 'ua' ? 'uk' : 'en';
  }

  static readInitialLocale(isBrowser: boolean): UiLocale {
    if (isBrowser) {
      const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);

      if (storedLocale === 'en' || storedLocale === 'ua') {
        return storedLocale;
      }

      const browserLocale = navigator.language.toLowerCase();

      if (browserLocale.startsWith('uk') || browserLocale.startsWith('ua')) {
        return 'ua';
      }
    }

    return 'ua';
  }

  static persistLocale(locale: UiLocale, isBrowser: boolean): void {
    if (!isBrowser) {
      return;
    }

    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }

  static interpolate(template: string, params?: Record<string, string>): string {
    if (!params) {
      return template;
    }

    return template.replace(/\{\{(\w+)}}/g, (_, paramKey) => params[paramKey] ?? `{{${paramKey}}}`);
  }

  static readDictionaryValue(dictionary: TranslationDictionary, key: string): string | TranslationDictionary | undefined {
    return key.split('.').reduce<string | TranslationDictionary | undefined>((currentValue, segment) => {
      if (currentValue === undefined || typeof currentValue === 'string') {
        return undefined;
      }

      return currentValue[segment];
    }, dictionary);
  }
}
