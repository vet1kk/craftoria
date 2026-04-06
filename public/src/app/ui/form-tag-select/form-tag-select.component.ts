import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SelectOption, SelectValue } from '../../models';
import { ValidationService } from '../../services';

@Component({
  selector: 'ui-form-tag-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-tag-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormTagSelectComponent {
  private readonly validationService = inject(ValidationService);

  readonly label = input.required<string>();
  readonly showLabel = input(true);
  readonly required = input(false);
  readonly control = input.required<FormControl<SelectValue | SelectValue[] | null>>();
  readonly options = input<SelectOption[]>([]);
  readonly multiple = input(false);
  readonly emptyOptionLabel = input('');
  readonly hasError = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly validationGroup = input<string | null>(null);
  readonly validationKey = input<string | null>(null);
  readonly validationMessages = input<Record<string, string>>({});
  readonly fallbackErrorMessage = input('Invalid value');

  readonly selectionChange = output<void>();
  readonly selectionBlur = output<void>();

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

  isSelected(value: SelectValue): boolean {
    const current = this.control().value;

    if (this.multiple()) {
      return Array.isArray(current) && current.some((item) => String(item) === String(value));
    }

    return current !== null && !Array.isArray(current) && String(current) === String(value);
  }

  select(value: SelectValue): void {
    if (this.multiple()) {
      const currentValue = this.control().value;
      const current: SelectValue[] = Array.isArray(currentValue) ? currentValue : [];
      const next = this.isSelected(value)
        ? current.filter((item) => String(item) !== String(value))
        : [...current, value];

      this.control().setValue(next);
      this.control().markAsDirty();
      this.onSelectionChange();
      return;
    }

    this.control().setValue(this.isSelected(value) ? null : value);
    this.control().markAsDirty();
    this.onSelectionChange();
  }

  selectEmpty(): void {
    this.control().setValue(this.multiple() ? [] : null);
    this.control().markAsDirty();
    this.onSelectionChange();
  }

  isEmptySelected(): boolean {
    const current = this.control().value;

    if (this.multiple()) {
      return Array.isArray(current) && current.length === 0;
    }

    return current === null || current === '';
  }

  onSelectionChange(): void {
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
