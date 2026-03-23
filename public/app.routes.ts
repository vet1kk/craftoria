import { Routes } from '@angular/router';

import { adminGuard } from './guards/admin.guard';

export const appRoutes: Routes = [
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.component').then((module) => module.ProductsComponent)
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./pages/product/product.component').then((module) => module.ProductComponent)
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
  { path: '**', redirectTo: 'products' }
];
