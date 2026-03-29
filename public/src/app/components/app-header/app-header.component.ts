import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService, CartDrawerService, CartService, DataService } from '../../services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DecimalPipe, TranslatePipe, NgTemplateOutlet],
  templateUrl: './app-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
  @ViewChild('headerNav', { static: true }) private readonly headerNav?: ElementRef<HTMLElement>;

  readonly dataService = inject(DataService);
  readonly cartService = inject(CartService);
  readonly cartDrawerService = inject(CartDrawerService);
  readonly authService = inject(AuthService);
  readonly isMobileMenuOpen = signal(false);
  protected readonly router = inject(Router);

  get avatarInitials(): string {
    const user = this.authService.currentUser();

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

  async logout(): Promise<void> {
    this.closeMobileMenu();
    await this.authService.logout();
    await this.router.navigate(['/products']);
  }
}
