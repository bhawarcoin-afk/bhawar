import { Routes } from '@angular/router';
import { CoinScannerComponent } from './components/coin-scanner/coin-scanner.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const APP_ROUTES: Routes = [
  { 
    path: '', 
    redirectTo: 'home', 
    pathMatch: 'full' 
  },
  { 
    path: 'home', 
    loadComponent: () => import('./components/pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'scan', 
    component: CoinScannerComponent 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/pages/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./components/pages/signup/signup.component').then(m => m.SignUpComponent)
  },
  { 
    path: 'collections', 
    loadComponent: () => import('./components/pages/collections/collections.component').then(m => m.CollectionsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'auction',
    loadComponent: () => import('./components/pages/auction/auction.component').then(m => m.AuctionComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'qr-scan', 
    loadComponent: () => import('./components/qr-scanner/qr-scanner.component').then(m => m.QrScannerComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  { 
    path: 'mints', 
    loadComponent: () => import('./components/pages/mints/mints.component').then(m => m.MintsComponent)
  },
  { 
    path: 'category/:name', 
    loadComponent: () => import('./components/pages/category/category.component').then(m => m.CategoryComponent)
  },
   { 
    path: 'accessories', 
    loadComponent: () => import('./components/pages/accessories/accessories.component').then(m => m.AccessoriesComponent)
  },
  { 
    path: '**', 
    redirectTo: 'home' 
  } // Wildcard route for a 404 page
];