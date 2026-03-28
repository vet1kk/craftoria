import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';

import { ToastService } from '../../services';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  templateUrl: './toast-container.component.html'
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      this.toastService.toasts();
      this.cdr.markForCheck();
    });
  }
}
