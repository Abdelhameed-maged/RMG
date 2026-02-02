import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, SidebarLink } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  sidebarLinks = input<SidebarLink[]>([
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'User Management',
      icon: 'users',
      children: [
        { label: 'User List', route: '/users/list' },
      ]
    }
  ]);
  
  sidebarCollapsed = input<boolean>(false);
  showBreadcrumb = input<boolean>(true);
}
