import { Routes } from '@angular/router';

import { adminGuard } from './guards/admin.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/menu/menu.component').then((module) => module.MenuComponent)
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./pages/account/account.component').then((module) => module.AccountComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin.component').then((module) => module.AdminComponent)
  },
  { path: '**', redirectTo: '' }
];
