import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ApplicationRef, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';

import { environment } from '../environments/environment';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly measurementId = environment.gaMeasurementId.trim();
  private readonly appRef = inject(ApplicationRef);
  private isInitialized = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId) || !this.measurementId) {
      return;
    }
    this.appRef.isStable
      .pipe(filter(Boolean), take(1))
      .subscribe(() => {
        this.injectGoogleAnalytics();
        this.trackRouteChanges();
      });
  }

  logEvent(eventName: string, params: Record<string, unknown> = {}): void {
    if (!this.isInitialized || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('event', eventName, params);
  }

  setUserProperties(properties: Record<string, unknown>): void {
    if (!this.isInitialized || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('set', 'user_properties', properties);
  }

  private injectGoogleAnalytics(): void {
    if (this.isInitialized) {
      return;
    }

    window.dataLayer = window.dataLayer ?? [];
    window.gtag ??= (...args: unknown[]) => {
      window.dataLayer.push(args);
    };

    if (!this.document.querySelector(`script[data-ga-id="${this.measurementId}"]`)) {
      const script = this.document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.measurementId)}`;
      script.dataset['gaId'] = this.measurementId;
      this.document.head.appendChild(script);
    }

    if (!this.document.querySelector(`script[data-ga-inline-id="${this.measurementId}"]`)) {
      const inlineScript = this.document.createElement('script');
      inlineScript.dataset['gaInlineId'] = this.measurementId;
      inlineScript.text = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${this.measurementId}', { send_page_view: false });
      `;
      this.document.head.appendChild(inlineScript);
    } else {
      window.gtag('js', new Date());
      window.gtag('config', this.measurementId, { send_page_view: false });
    }

    this.isInitialized = true;
  }

  private trackRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  private trackPageView(path: string): void {
    if (!window.gtag) {
      return;
    }

    window.gtag('config', this.measurementId, {
      page_path: path,
      page_title: this.document.title,
      page_location: this.document.location?.href
    });
  }
}
