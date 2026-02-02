import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { filter } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs = signal<Breadcrumb[]>([]);

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.buildBreadcrumbs();
    
    // Rebuild breadcrumbs on navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.buildBreadcrumbs());
  }

  private buildBreadcrumbs() {
    const breadcrumbs: Breadcrumb[] = [];
    let route = this.activatedRoute.root;
    let url = '';

    while (route) {
      const children = route.children;
      
      if (children.length === 0) {
        break;
      }

      route = children[0];
      
      // Get route segment
      const routeSnapshot = route.snapshot;
      const path = routeSnapshot.url.map(segment => segment.path).join('/');
      
      if (path) {
        url += `/${path}`;
        
        // Get breadcrumb label from route data or use path
        const label = routeSnapshot.data['breadcrumb'] || this.formatLabel(path);
        
        breadcrumbs.push({ label, url });
      }
    }

    this.breadcrumbs.set(breadcrumbs);
  }

  private formatLabel(path: string): string {
    // Convert kebab-case to Title Case
    return path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
