import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { EmptyImagePlaceholderComponent } from '../../../../ui';

export interface GallerySlot {
  image_url: string | null;
  is_placeholder: boolean;
}

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [TranslatePipe, EmptyImagePlaceholderComponent],
  templateUrl: './product-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductGalleryComponent {
  readonly images = input.required<string[]>();
  readonly itemName = input.required<string>();

  readonly imageSelect = output<number>();

  readonly selectedIndex = signal(0);
  readonly failedImages = signal<Set<string>>(new Set());

  readonly previewSlots = computed(() => {
    const slots: GallerySlot[] = this.images().map((image_url) => ({
      image_url,
      is_placeholder: false
    }));

    while (slots.length < 4) {
      slots.push({ image_url: null, is_placeholder: true });
    }

    return slots;
  });

  readonly hasImages = computed(() => this.images().length > 0);
  readonly hasMultipleImages = computed(() => this.images().length > 1);
  readonly hasThumbnailOverflow = computed(() => this.previewSlots().length > 4);
  readonly selectedPosition = computed(() => this.images().length ? this.selectedIndex() + 1 : 0);

  readonly selectedImageUrl = computed(() => {
    const imageUrl = this.images()[this.selectedIndex()];
    if (!imageUrl || this.failedImages().has(imageUrl)) {
      return null;
    }
    return imageUrl;
  });

  selectImage(index: number): void {
    if (index >= this.images().length) {
      return;
    }
    this.selectedIndex.set(index);
    this.imageSelect.emit(index);
  }

  showPreviousImage(): void {
    const total = this.images().length;
    if (total === 0) {
      return;
    }
    this.selectedIndex.update((i) => (i - 1 + total) % total);
  }

  showNextImage(): void {
    const total = this.images().length;
    if (total === 0) {
      return;
    }
    this.selectedIndex.update((i) => (i + 1) % total);
  }

  handleImageError(imageUrl: string): void {
    this.failedImages.update((current) => new Set(current).add(imageUrl));
  }

  isImageFailed(imageUrl: string): boolean {
    return this.failedImages().has(imageUrl);
  }
}
