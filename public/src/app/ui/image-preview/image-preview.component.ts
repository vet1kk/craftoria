import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { ModalComponent } from '../modal';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'ui-image-preview',
  standalone: true,
  imports: [ModalComponent, NgOptimizedImage],
  templateUrl: './image-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagePreviewComponent {
  readonly src = input.required<string>();
  readonly alt = input('Image preview');
  readonly width = input<number | null>(null);
  readonly height = input<number | null>(null);
  readonly thumbnailClass = input('h-12 w-12 rounded-lg bg-stone-200 object-cover');
  readonly fullImageClass = input('max-h-[85vh] w-full rounded-2xl object-contain');
  readonly buttonClass = input('inline-flex overflow-hidden rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500');
  readonly modalMaxWidth = input<'md' | 'lg' | 'xl' | '2xl'>('2xl');

  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
