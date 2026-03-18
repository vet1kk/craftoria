import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type UiLocale = 'en' | 'ua';

const LOCALE_STORAGE_KEY = 'craftoria.locale';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly locale = signal<UiLocale>(this.readInitialLocale());
  readonly apiLocale = computed(() => this.locale() === 'ua' ? 'uk' : 'en');

  setLocale(locale: UiLocale): void {
    if (this.locale() === locale) {
      return;
    }

    this.locale.set(locale);
    this.persistLocale(locale);
  }

  private readInitialLocale(): UiLocale {
    if (isPlatformBrowser(this.platformId)) {
      const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);

      if (storedLocale === 'en' || storedLocale === 'ua') {
        return storedLocale;
      }

      const browserLocale = navigator.language.toLowerCase();

      if (browserLocale.startsWith('uk') || browserLocale.startsWith('ua')) {
        return 'ua';
      }
    }

    return 'en';
  }

  private persistLocale(locale: UiLocale): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}
