import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, Output } from '@angular/core';
import { finalize, take } from 'rxjs';

import { ApiErrorHelper } from '../../../../../../helpers';
import { Product } from '../../../../../../models';
import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { I18nService, ProductApiService, ToastService, TransitionStateService } from '../../../../../../services';
import { ButtonComponent, LoaderComponent } from '../../../../../../ui';

@Component({
  selector: 'app-admin-product-delete-modal',
  standalone: true,
  imports: [TranslatePipe, LoaderComponent, ButtonComponent],
  templateUrl: './admin-product-delete-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductDeleteModalComponent {
  private readonly productApiService = inject(ProductApiService);
  private readonly i18n = inject(I18nService);
  private readonly toastService = inject(ToastService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly transitionStateService = inject(TransitionStateService);

  readonly product = input.required<Product>();
  readonly transition = this.transitionStateService.create<'delete'>();
  readonly isBusy = this.transition.isBusy;
  readonly actionError = this.transition.error;

  @Output() readonly closeRequested = new EventEmitter<void>();
  @Output() readonly completed = new EventEmitter<void>();

  confirmDelete(): void {
    this.transition.start('delete');

    this.productApiService.delete(this.product().id).pipe(
      take(1),
      finalize(() => this.transition.finish())
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.productDeleteSuccess'));
        this.completed.emit();
        this.closeRequested.emit();
      },
      error: (error: unknown) => {
        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.productDeleteError'));
        this.transition.fail(message);
        this.toastService.error(message);
      }
    });
  }

  busyActionLabel(): string {
    return this.i18n.translate('ui.admin.productDeleteAction');
  }
}
