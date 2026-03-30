import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserService } from '../services';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(UserService);
  const router = inject(Router);

  return authService.isAdmin() ? true : router.createUrlTree(['/account']);
};
