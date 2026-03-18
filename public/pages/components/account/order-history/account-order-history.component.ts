import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { Order, OrderStatus } from '../../../../models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services';

@Component({
  selector: 'app-account-order-history',
  standalone: true,
  imports: [DatePipe, DecimalPipe, TranslatePipe],
  templateUrl: './account-order-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountOrderHistoryComponent {
  private readonly i18n = inject(I18nService);

  readonly orders = input.required<Order[]>();
  readonly repeatOrderError = input('');
  readonly repeatOrder = output<Order>();

  getOrderStatusClasses(status: OrderStatus): string {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'confirmed':
      case 'ready':
        return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200';
      case 'preparing':
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 ring-1 ring-stone-200';
    }
  }

  getOrderStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return this.i18n.translate('ui.orders.status.pending');
      case 'confirmed':
        return this.i18n.translate('ui.orders.status.confirmed');
      case 'preparing':
        return this.i18n.translate('ui.orders.status.preparing');
      case 'ready':
        return this.i18n.translate('ui.orders.status.ready');
      case 'delivered':
        return this.i18n.translate('ui.orders.status.delivered');
      case 'cancelled':
        return this.i18n.translate('ui.orders.status.cancelled');
      default:
        return this.i18n.translate('ui.orders.status.unknown');
    }
  }
}
