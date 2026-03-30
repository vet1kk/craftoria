import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, Product } from '../../models';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {
  private readonly apiService = inject(ApiService);

  listing(params: Partial<Record<string, any>> = {}, filter: Record<string, any> = {}): Observable<ApiResponse<Product[]>> {
    const httpParams = this.apiService.build(params, filter);

    return this.apiService.get<Product[]>('/products', httpParams);
  }

  item(slug: string): Observable<ApiResponse<Product>> {
    return this.apiService.get<Product>(`/products/${slug}`);
  }
}

