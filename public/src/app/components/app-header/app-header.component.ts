import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { take } from 'rxjs';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthApiService, CartDrawerService, CartService, SettingsApiService, UserService } from '../../services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DecimalPipe, TranslatePipe, NgTemplateOutlet],
  templateUrl: './app-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
  @ViewChild('headerNav', { static: true }) private readonly headerNav?: ElementRef<HTMLElement>;

  private readonly settingsApiService = inject(SettingsApiService);
  private readonly authApiService = inject(AuthApiService);
  readonly cartService = inject(CartService);
  readonly cartDrawerService = inject(CartDrawerService);
  readonly userService = inject(UserService);
  readonly isMobileMenuOpen = signal(false);
  readonly currency = signal('');
  protected readonly router = inject(Router);

  constructor() {
    this.settingsApiService.settings().pipe(take(1)).subscribe((response) => {
      this.currency.set(response.data.currency);
    });
  }

  get avatarInitials(): string {
    const user = this.userService.currentUser();

    if (!user) {
      return '';
    }

    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  openCart(): void {
    this.closeMobileMenu();
    this.cartDrawerService.open();
  }

  logout(): void {
    this.closeMobileMenu();
    this.authApiService.logout().pipe(take(1)).subscribe({
      next: () => {
        this.userService.clearToken();
        this.userService.clearCurrentUser();
        void this.router.navigate(['/products']);
      },
      error: () => {
        this.userService.clearToken();
        this.userService.clearCurrentUser();
      }
    });
  }
}
