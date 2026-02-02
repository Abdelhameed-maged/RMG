import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  { 
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Dashboard' }
  },
  {
    path: 'products',
    canActivate: [authGuard],
    data: { breadcrumb: 'Products' },
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        loadComponent: () => import('./features/products/pages/product-list/product-list.component').then(m => m.ProductListComponent),
        data: { breadcrumb: 'Product List' }
      }
    ]
  },
  {
    path: 'invoices',
    canActivate: [authGuard],
    data: { breadcrumb: 'Invoices' },
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        loadComponent: () => import('./features/invoices/pages/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent),
        data: { breadcrumb: 'Invoice List' }
      },
      {
        path: 'create',
        loadComponent: () => import('./features/invoices/pages/invoice-create/invoice-create.component').then(m => m.InvoiceCreateComponent),
        data: { breadcrumb: 'Create Invoice' }
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
