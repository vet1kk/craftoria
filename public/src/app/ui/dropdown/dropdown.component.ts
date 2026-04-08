import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';

export interface DropdownOption {
  value: string;
  labelKey: string;
}

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dropdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent {
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  readonly ariaLabelKey = input('ui.actions.select');
  readonly selectedValue = input.required<string>();
  readonly selectedLabelKey = input.required<string>();
  readonly options = input<ReadonlyArray<DropdownOption>>([]);
  readonly buttonClassName = input('h-11 w-full rounded-md border border-stone-200 bg-white px-4 text-left text-base text-stone-800 transition-colors focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200');
  readonly menuClassName = input('absolute right-0 z-20 mt-1 w-full overflow-hidden rounded-md border border-stone-200 bg-white shadow-lg');
  readonly optionClassName = input('block w-full px-4 py-3 text-left text-base text-stone-800 transition-colors hover:bg-stone-100');

  readonly valueChange = output<string>();
  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  select(value: string): void {
    this.valueChange.emit(value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) {
      return;
    }

    const target = event.target as Node | null;

    if (target && !this.hostElement.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }
}
