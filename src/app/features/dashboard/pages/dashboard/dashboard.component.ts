import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService } from '../../../../core/services/auth.service';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  user = this.authService.user;

  cards: DashboardCard[] = [
    {
      title: 'Products',
      description: 'Manage your product catalog, add new items, update prices and stock levels',
      icon: 'inventory_2',
      route: '/products',
      color: '#1976d2'
    },
    {
      title: 'Invoices',
      description: 'Create and manage invoices, track payments and invoice history',
      icon: 'receipt_long',
      route: '/invoices',
      color: '#388e3c'
    }
  ];

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
