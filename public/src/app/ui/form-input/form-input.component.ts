import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputType } from '../../models';
import { ValidationService } from '../../services';
import { VerifiableInputComponent } from '../verifiable-input';

@Component({
  selector: 'ui-form-input',
  standalone: true,
  imports: [ReactiveFormsModule, VerifiableInputComponent],
  templateUrl: './form-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormInputComponent {
  private readonly validationService = inject(ValidationService);

  readonly type = input<InputType>('text');
  readonly label = input.required<string>();
  readonly required = input(false);
  readonly control = input.required<FormControl<string>>();
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly hasError = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly validationGroup = input<string | null>(null);
  readonly validationKey = input<string | null>(null);
  readonly validationMessages = input<Record<string, string>>({});
  readonly fallbackErrorMessage = input('Invalid value');

  readonly inputBlur = output<void>();
  readonly inputChange = output<void>();

  resolvedHasError(): boolean {
    if (this.hasError()) {
      return true;
    }

    const group = this.validationGroup();
    const key = this.validationKey();

    if (group && key && this.validationService.hasFieldError(group, key)) {
      return true;
    }

    return this.validationService.hasError(this.control());
  }

  resolvedErrorMessage(): string | null {
    if (this.errorMessage()) {
      return this.errorMessage();
    }

    const group = this.validationGroup();
    const key = this.validationKey();

    if (group && key) {
      const serverMessage = this.validationService.getFieldErrorMessage(group, key);

      if (serverMessage) {
        return serverMessage;
      }
    }

    return this.validationService.getErrorMessage(
      this.control(),
      this.validationMessages(),
      this.fallbackErrorMessage()
    );
  }

  onInput(): void {
    const group = this.validationGroup();
    const key = this.validationKey();

    if (group && key) {
      this.validationService.clearFieldError(group, key);
    }

    this.inputChange.emit();
  }

  onBlur(): void {
    const group = this.validationGroup();
    const key = this.validationKey();

    if (group && key) {
      this.validationService.clearFieldError(group, key);
    }

    this.inputBlur.emit();
  }
}
