import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SelectOption } from '../../models';
import { ValidationService } from '../../services';
import { VerifiableInputComponent } from '../verifiable-input';

@Component({
  selector: 'ui-form-select',
  standalone: true,
  imports: [ReactiveFormsModule, VerifiableInputComponent],
  templateUrl: './form-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSelectComponent {
  private readonly validationService = inject(ValidationService);

  readonly label = input.required<string>();
  readonly required = input(false);
  readonly control = input.required<FormControl<string | string[] | number | null>>();
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input('');
  readonly multiple = input(false);
  readonly size = input(6);
  readonly hasError = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly validationGroup = input<string | null>(null);
  readonly validationKey = input<string | null>(null);
  readonly validationMessages = input<Record<string, string>>({});
  readonly fallbackErrorMessage = input('Invalid value');

  readonly selectionBlur = output<void>();
  readonly selectionChange = output<void>();

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

  onSelectionChange(event: Event): void {
    if (this.multiple()) {
      const target = event.target as HTMLSelectElement;
      const selectedValues = Array.from(target.selectedOptions).map((option) => option.value);

      this.control().setValue(selectedValues);
    }

    const group = this.validationGroup();
    const key = this.validationKey();

    if (group && key) {
      this.validationService.clearFieldError(group, key);
    }

    this.selectionChange.emit();
  }

  onBlur(): void {
    const group = this.validationGroup();
    const key = this.validationKey();

    if (group && key) {
      this.validationService.clearFieldError(group, key);
    }

    this.selectionBlur.emit();
  }
}
