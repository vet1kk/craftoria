import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApplicationRef, DestroyRef, inject, Injectable, PLATFORM_ID } from '@angular/core';
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
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly measurementId = environment.gaMeasurementId.trim();
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionId = this.readSessionId();
  private isGoogleAnalyticsInitialized = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.appRef.isStable
      .pipe(filter(Boolean), take(1))
      .subscribe(() => {
        if (this.measurementId) {
          this.injectGoogleAnalytics();
        }

        this.trackRouteChanges();
      });
  }

  logEvent(eventName: string, params: Record<string, unknown> = {}): void {
    if (this.isGoogleAnalyticsInitialized && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }

    this.http.post(`${environment.apiBaseUrl}/analytics/events`, {
      session_id: this.sessionId,
      name: eventName,
      url: this.document.location?.href,
      properties: params,
      occurred_at: new Date().toISOString()
    }).subscribe({
      error: () => undefined
    });
  }

  setUserProperties(properties: Record<string, unknown>): void {
    if (!this.isGoogleAnalyticsInitialized || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('set', 'user_properties', properties);
  }

  private injectGoogleAnalytics(): void {
    if (this.isGoogleAnalyticsInitialized) {
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

    this.isGoogleAnalyticsInitialized = true;
  }

  private trackRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  private trackPageView(path: string): void {
    if (this.isGoogleAnalyticsInitialized && window.gtag) {
      window.gtag('config', this.measurementId, {
        page_path: path,
        page_title: this.document.title,
        page_location: this.document.location?.href
      });
    }

    this.logEvent('page_view', {
      page_path: path,
      page_title: this.document.title
    });
  }

  private readSessionId(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const existingSessionId = sessionStorage.getItem('craftoria.analytics-session-id');

    if (existingSessionId) {
      return existingSessionId;
    }

    const sessionId = crypto.randomUUID();
    sessionStorage.setItem('craftoria.analytics-session-id', sessionId);

    return sessionId;
  }
}
