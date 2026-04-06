import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { TranslatePipe } from '../../../../../../pipes/translate.pipe';
import { FormInputComponent } from '../../../../../../ui';

@Component({
  selector: 'app-admin-category-form-fields',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, FormInputComponent],
  templateUrl: './admin-category-form-fields.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoryFormFieldsComponent {
  readonly validationGroupName = input.required<string>();
  readonly categoryForm = input.required<FormGroup>();
  readonly selectedImageName = input.required<string>();

  @Output() readonly imageSelected = new EventEmitter<Event>();
}
