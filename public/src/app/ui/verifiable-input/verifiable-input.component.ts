import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { ValidationService } from '../../services';

@Component({
  selector: 'app-verifiable-input',
  standalone: true,
  templateUrl: './verifiable-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifiableInputComponent {
  private readonly validationService = inject(ValidationService);

  readonly group = input<string | null>(null);
  readonly field = input<string | null>(null);

  get error(): string {
    const group = this.group();
    const field = this.field();

    if (!group || !field) {
      return '';
    }

    return this.validationService.getError(group, field);
  }
}
