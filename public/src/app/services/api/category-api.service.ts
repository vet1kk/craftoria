import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, Category, CategoryProductOption, CategoryUpsertPayload } from '../../models';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {
  private readonly apiService = inject(ApiService);

  listing(params: Partial<Record<string, any>> = {}, filter: Record<string, any> = {}): Observable<ApiResponse<Category[]>> {
    const httpParams = this.apiService.build(params, filter);

    return this.apiService.get<Category[]>('/categories', httpParams);
  }

  options(): Observable<ApiResponse<CategoryProductOption[]>> {
    return this.apiService.get<CategoryProductOption[]>('/categories/options');
  }

  create(payload: FormData | CategoryUpsertPayload): Observable<ApiResponse<Category>> {
    return this.apiService.post<Category>('/categories', payload);
  }

  update(categoryId: string, payload: FormData | CategoryUpsertPayload): Observable<ApiResponse<Category>> {
    return this.apiService.post<Category>(`/categories/${categoryId}`, payload);
  }

  updateTranslations(categoryId: string, locale: string, fields: Record<string, string | null>): Observable<ApiResponse<Category>> {
    return this.apiService.put<Category>(`/categories/${categoryId}/translations`, {
      locale,
      fields,
    });
  }

  assignProducts(categoryId: string, productIds: string[]): Observable<ApiResponse<Category>> {
    return this.apiService.put<Category>(`/categories/${categoryId}/products`, {
      product_ids: productIds
    });
  }

  delete(categoryId: string): Observable<ApiResponse<null>> {
    return this.apiService.delete<null>(`/categories/${categoryId}`);
  }
}
