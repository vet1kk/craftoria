import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { CategoryProductOption } from '../models';
import { CategoryApiService } from '../services';

export const categoryProductOptionsResolver: ResolveFn<CategoryProductOption[]> = () => {
  const categoryApiService = inject(CategoryApiService);

  return categoryApiService.options().pipe(
    map((response) => response.data ?? []),
    catchError(() => of([]))
  );
};
