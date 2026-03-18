import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService, DataService, I18nService, MenuService } from '../../services';

interface GallerySlot {
  imageUrl: string | null;
  isPlaceholder: boolean;
}

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [DecimalPipe, RouterLink, TranslatePipe],
  templateUrl: './item-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemDetailComponent {
  readonly dataService = inject(DataService);
  readonly menuService = inject(MenuService);
  readonly cartService = inject(CartService);
  readonly i18n = inject(I18nService);
  readonly selectedImageIndex = signal(0);
  readonly failedImages = signal<Set<string>>(new Set());
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  private readonly route = inject(ActivatedRoute);
  private readonly itemSlug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('slug') ?? '' }
  );

  readonly item = computed(() => this.menuService.getMenuItemBySlug(this.itemSlug()));
  readonly category = computed(() => {
    const menuItem = this.item();

    if (!menuItem) {
      return undefined;
    }

    return this.menuService.getCategoryById(menuItem.categoryId);
  });
  readonly galleryImages = computed(() => {
    const menuItem = this.item();

    if (!menuItem) {
      return [];
    }

    return [...menuItem.galleryImageUrls].filter(
      (imageUrl, index, allImages) => Boolean(imageUrl) && allImages.indexOf(imageUrl) === index
    );
  });
  readonly galleryPreviewImages = computed(() => {
    const slots: GallerySlot[] = this.galleryImages().map((imageUrl) => ({
      imageUrl,
      isPlaceholder: false
    }));

    while (slots.length < 4) {
      slots.push({
        imageUrl: null,
        isPlaceholder: true
      });
    }

    return slots;
  });
  readonly hasGalleryImages = computed(() => this.galleryImages().length > 0);
  readonly hasMultipleGalleryImages = computed(() => this.galleryImages().length > 1);
  readonly hasThumbnailOverflow = computed(() => this.galleryPreviewImages().length > 4);
  readonly selectedImagePosition = computed(() => this.galleryImages().length ? this.selectedImageIndex() + 1 : 0);
  readonly nutrition = computed(() => {
    const menuItem = this.item();

    if (!menuItem) {
      return undefined;
    }

    return this.menuService.getMenuItemNutrition(menuItem);
  });
  readonly portionLabel = computed(() => {
    const menuItem = this.item();

    if (!menuItem) {
      return '';
    }

    return this.menuService.getMenuItemPortionLabel(menuItem);
  });
  readonly ingredientBreakdown = computed(() => {
    const menuItem = this.item();

    if (!menuItem) {
      return [];
    }

    return this.menuService.getMenuItemIngredientBreakdown(menuItem);
  });
  readonly selectedImageUrl = computed(() => {
    const imageUrl = this.galleryImages()[this.selectedImageIndex()];
    if (!imageUrl || this.failedImages().has(imageUrl)) {
      return null;
    }
    return imageUrl;
  });

  constructor() {
    effect(() => {
      const slug = this.itemSlug();

      this.selectedImageIndex.set(0);
      this.loadError.set('');

      if (!slug) {
        this.isLoading.set(false);
        return;
      }

      if (this.menuService.getMenuItemBySlug(slug)) {
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);

      void this.dataService.loadMenuItem(slug).then((item) => {
        this.isLoading.set(false);

        if (!item) {
          this.loadError.set(this.i18n.translate('ui.itemDetail.notFoundHint'));
        }
      });
    });

    effect(() => {
      const images = this.galleryImages();
      const selectedIndex = this.selectedImageIndex();

      if (selectedIndex >= images.length && images.length > 0) {
        this.selectedImageIndex.set(images.length - 1);
      }
    });
  }

  selectImage(index: number): void {
    if (index >= this.galleryImages().length) {
      return;
    }

    this.selectedImageIndex.set(index);
  }

  showPreviousImage(): void {
    const totalImages = this.galleryImages().length;

    if (totalImages === 0) {
      return;
    }

    this.selectedImageIndex.update((currentIndex) => (currentIndex - 1 + totalImages) % totalImages);
  }

  showNextImage(): void {
    const totalImages = this.galleryImages().length;

    if (totalImages === 0) {
      return;
    }

    this.selectedImageIndex.update((currentIndex) => (currentIndex + 1) % totalImages);
  }

  handleImageError(imageUrl: string): void {
    this.failedImages.update((current) => new Set(current).add(imageUrl));
  }

  isImageFailed(imageUrl: string): boolean {
    return this.failedImages().has(imageUrl);
  }
}
