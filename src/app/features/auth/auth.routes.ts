import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { guestGuard } from '../../core/guards/auth.guard';

export const authRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] }
];
