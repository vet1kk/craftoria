import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputType } from '../../models';

@Component({
  selector: 'ui-form-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormInputComponent {
  readonly type = input<InputType>('text');
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string>>();
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly hasError = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly inputBlur = output<void>();
  readonly inputChange = output<void>();
}
