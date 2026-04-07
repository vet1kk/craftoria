import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { SelectOption } from '../../../../../../models';
import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { FormInputComponent, FormTagSelectComponent } from '../../../../../../ui';

@Component({
  selector: 'app-admin-product-form-fields',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, FormInputComponent, FormTagSelectComponent],
  templateUrl: './admin-product-form-fields.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductFormFieldsComponent {
  readonly validationGroupName = input.required<string>();
  readonly productForm = input.required<FormGroup>();
  readonly categoryOptions = input.required<SelectOption[]>();
  readonly selectedImageName = input.required<string>();

  @Output() readonly imageSelected = new EventEmitter<Event>();
}
