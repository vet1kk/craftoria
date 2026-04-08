import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserService } from '../services';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(UserService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  return router.createUrlTree([authService.isAuthenticated() ? '/profile' : '/account']);
};
