import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { CatalogData } from '../../models';
import { CategoryApiService } from './category-api.service';
import { ProductApiService } from './product-api.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogApiService {
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly productApiService = inject(ProductApiService);

  loadCatalog(): Observable<CatalogData> {
    return forkJoin([
      this.categoryApiService.listing(),
      this.productApiService.listing()
    ]).pipe(
      map(([categoriesResponse, productsResponse]) => ({
        categories: (categoriesResponse.data ?? []).filter((category) => Boolean(category?.id)),
        products: (productsResponse.data ?? []).filter((product) => Boolean(product?.id))
      }))
    );
  }
}
