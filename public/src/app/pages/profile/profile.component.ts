import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of, take } from 'rxjs';

import { CartItem, Order, Product, SkeletonGroupConfig } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartDrawerService, CartService, I18nService, OrderApiService, ProductApiService, UserService } from '../../services';
import { LoaderComponent, SkeletonComponent } from '../../ui';
import { AccountOrderHistoryComponent, AccountProfileSummaryComponent } from '../components';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AccountProfileSummaryComponent, AccountOrderHistoryComponent, TranslatePipe, LoaderComponent, SkeletonComponent],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  readonly authService = inject(UserService);
  private readonly orderApiService = inject(OrderApiService);
  private readonly productApiService = inject(ProductApiService);
  private readonly cartService = inject(CartService);
  private readonly cartDrawerService = inject(CartDrawerService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  private readonly products = signal<Product[]>([]);

  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isAdmin = this.authService.isAdmin;
  readonly isRedirecting = signal(false);
  readonly isOrdersLoading = signal(false);
  readonly repeatOrderError = signal('');
  readonly orders = signal<Order[]>([]);
  readonly ordersSkeletonGroups: SkeletonGroupConfig[] = [
    {
      lines: [
        { widthClass: 'w-44', heightClass: 'h-6', tone: 'default' },
        { widthClass: 'w-60', heightClass: 'h-4', tone: 'muted' }
      ]
    },
    {
      className: 'rounded-2xl border border-stone-100 p-5',
      lines: [
        { widthClass: 'w-32', heightClass: 'h-4', tone: 'default' },
        { widthClass: 'w-24', heightClass: 'h-4', className: 'mt-3', tone: 'muted' },
        { widthClass: 'w-full', heightClass: 'h-10', className: 'mt-4', roundedClass: 'rounded-xl', tone: 'muted' }
      ]
    }
  ];

  constructor() {
    this.productApiService.listing().pipe(take(1)).subscribe((response) => {
      this.products.set(response.data ?? []);
    });

    effect(() => {
      const user = this.currentUser();

      if (!user) {
        this.orders.set([]);
        this.isOrdersLoading.set(false);

        if (!this.isRedirecting()) {
          this.isRedirecting.set(true);
          void this.router.navigate(['/account'], { replaceUrl: true }).finally(() => {
            this.isRedirecting.set(false);
          });
        }

        return;
      }

      this.loadProfileOrders();
    });
  }

  repeatOrder(order: Order): void {
    const repeatedItems = (order?.items ?? []).reduce<CartItem[]>((items, orderItem) => {
      const product = this.products().find((item) => item.id === orderItem.product_id);

      if (!product) {
        return items;
      }

      items.push({
        product: product,
        quantity: orderItem.quantity,
        ...(orderItem.notes ? { notes: orderItem.notes } : {})
      });

      return items;
    }, []);

    if (repeatedItems.length === 0) {
      this.repeatOrderError.set(this.i18n.translate('ui.account.repeatOrderFailed'));
      return;
    }

    this.repeatOrderError.set('');
    this.cartService.replaceCart(repeatedItems);
    this.cartDrawerService.open();
  }

  private loadProfileOrders(): void {
    this.isOrdersLoading.set(true);

    this.orderApiService.profileOrders().pipe(
      take(1),
      catchError(() => {
        this.orders.set([]);
        return of({ data: [] as Order[] });
      }),
      finalize(() => this.isOrdersLoading.set(false))
    ).subscribe((response) => {
      this.orders.set(response.data ?? []);
    });
  }
}
