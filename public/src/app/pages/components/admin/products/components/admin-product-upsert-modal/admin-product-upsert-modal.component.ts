import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Category, SelectOption } from '../../../../../../models';
import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { ButtonComponent, FormInputComponent, FormTagSelectComponent, LoaderComponent } from '../../../../../../ui';

@Component({
  selector: 'app-admin-product-upsert-modal',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, FormInputComponent, FormTagSelectComponent, LoaderComponent, ButtonComponent],
  templateUrl: './admin-product-upsert-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductUpsertModalComponent {
  readonly isCreate = input(false);
  readonly formGroup = input<FormGroup | null>(null);
  readonly validationGroup = input.required<string>();
  readonly categories = input.required<Category[]>();
  readonly selectedImageName = input('');
  readonly isBusy = input(false);
  readonly actionError = input('');
  readonly busyActionLabel = input('');
  readonly isCreateSubmitDisabled = input(false);
  readonly isUpdateSubmitDisabled = input(false);

  readonly closeRequested = output<void>();
  readonly submitRequested = output<void>();
  readonly imageSelect = output<Event>();

  readonly categoryOptions = computed<SelectOption[]>(() => this.categories().map((category) => ({
    value: category.id,
    label: category.name
  })));

  controls(form: FormGroup): Record<string, any> {
    return form.controls as Record<string, any>;
  }
}
