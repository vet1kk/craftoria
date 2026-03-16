import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService, CartDrawerService, CartService, DataService } from '../../services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DecimalPipe],
  templateUrl: './app-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
  readonly dataService = inject(DataService);
  readonly cartService = inject(CartService);
  readonly cartDrawerService = inject(CartDrawerService);
  readonly authService = inject(AuthService);
  readonly isMobileMenuOpen = signal(false);
  private readonly router = inject(Router);

  get accountLabel(): string {
    return this.authService.isAuthenticated() ? 'Профіль' : 'Увійти';
  }

  get avatarLabel(): string {
    return this.authService.currentUser()?.fullName ?? '';
  }

  get avatarInitials(): string {
    const user = this.authService.currentUser();

    if (!user) {
      return '';
    }

    return user.fullName
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

  async logout(): Promise<void> {
    this.closeMobileMenu();
    this.authService.logout();
    await this.router.navigate(['/account']);
  }
}
