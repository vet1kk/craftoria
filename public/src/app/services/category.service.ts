import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, Category } from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {
  private readonly apiService = inject(ApiService);

  listing(params: Partial<Record<string, any>> = {}, filter: Record<string, any> = {}): Observable<ApiResponse<Category[]>> {
    const httpParams = this.apiService.build(params, filter);

    return this.apiService.get<Category[]>('/categories', httpParams);
  }
}


