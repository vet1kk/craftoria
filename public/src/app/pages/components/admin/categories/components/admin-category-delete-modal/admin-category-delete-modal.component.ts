import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, Output } from '@angular/core';
import { finalize, take } from 'rxjs';

import { Category } from '../../../../../../models';
import { ApiErrorHelper } from '../../../../../../helpers';
import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { CategoryApiService, I18nService, ToastService, TransitionStateService } from '../../../../../../services';
import { ButtonComponent, LoaderComponent } from '../../../../../../ui';

@Component({
  selector: 'app-admin-category-delete-modal',
  standalone: true,
  imports: [TranslatePipe, LoaderComponent, ButtonComponent],
  templateUrl: './admin-category-delete-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoryDeleteModalComponent {
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly i18n = inject(I18nService);
  private readonly toastService = inject(ToastService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly transitionStateService = inject(TransitionStateService);

  readonly category = input.required<Category>();
  readonly transition = this.transitionStateService.create<'delete'>();
  readonly isBusy = this.transition.isBusy;
  readonly actionError = this.transition.error;

  @Output() readonly closeRequested = new EventEmitter<void>();
  @Output() readonly completed = new EventEmitter<void>();

  confirmDelete(): void {
    this.transition.start('delete');

    this.categoryApiService.delete(this.category().id).pipe(
      take(1),
      finalize(() => this.transition.finish())
    ).subscribe({
      next: () => {
        this.toastService.success(this.i18n.translate('ui.admin.categoryDeleteSuccess'));
        this.completed.emit();
        this.closeRequested.emit();
      },
      error: (error: unknown) => {
        const message = this.apiErrorHelper.extractApiErrorMessage(error, this.i18n.translate('ui.admin.categoryDeleteError'));
        this.transition.fail(message);
        this.toastService.error(message);
      }
    });
  }

  busyActionLabel(): string {
    return this.i18n.translate('ui.admin.categoryDeleteAction');
  }
}
