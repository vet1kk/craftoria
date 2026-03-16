import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { OrderHistoryItem, OrderStatus } from '../../../../models';

@Component({
  selector: 'app-account-order-history',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './account-order-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountOrderHistoryComponent {
  readonly orders = input.required<OrderHistoryItem[]>();
  readonly repeatOrderError = input('');
  readonly repeatOrder = output<OrderHistoryItem>();

  getOrderStatusClasses(status: OrderStatus): string {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'preparing':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 ring-1 ring-stone-200';
    }
  }

  getOrderStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'delivered':
        return 'Доставлено';
      case 'preparing':
        return 'Готується';
      case 'cancelled':
        return 'Скасовано';
      default:
        return 'Оновлюється';
    }
  }
}
