import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, Product, ProductUpsertPayload } from '../../models';
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

  create(payload: FormData | ProductUpsertPayload): Observable<ApiResponse<Product>> {
    return this.apiService.post<Product>('/products', payload);
  }

  update(productId: string, payload: FormData | ProductUpsertPayload): Observable<ApiResponse<Product>> {
    return this.apiService.post<Product>(`/products/${productId}`, payload);
  }

  updateTranslations(productId: string, locale: string, fields: Record<string, string | null>): Observable<ApiResponse<Product>> {
    return this.apiService.put<Product>(`/products/${productId}/translations`, {
      locale,
      fields,
    });
  }

  delete(productId: string): Observable<ApiResponse<null>> {
    return this.apiService.delete<null>(`/products/${productId}`);
  }
}

