import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AnalyticsApiService } from './analytics-api.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly analyticsApiService = inject(AnalyticsApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private readonly sessionId = this.getOrCreateSessionId();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.trackRouteChanges();
    }
  }

  logEvent(eventName: string, params: Record<string, unknown> = {}): void {
    const payload = {
      session_id: this.sessionId,
      name: eventName,
      url: this.document.location?.href,
      properties: params,
      occurred_at: new Date().toISOString()
    };

    this.analyticsApiService.createEvent(payload).subscribe({
      error: (err) => console.error('Backend analytics failed:', err)
    });
  }

  private trackRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        this.logEvent('page_view', {
          page_path: event.urlAfterRedirects,
          page_title: this.document.title
        });
      });
  }

  private getOrCreateSessionId(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const key = 'craftoria.analytics-session-id';
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
  }
}