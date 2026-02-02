import { Router, NavigationEnd } from '@angular/router';
import { Component, input, signal, OnDestroy, inject } from '@angular/core';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-auth-wrapper',
  imports: [],
  templateUrl: './auth-wrapper.component.html',
  styleUrl: './auth-wrapper.component.scss'
})
export class AuthWrapperComponent implements OnDestroy {
  private router = inject(Router);
  
  customClasses = input<Array<string>>(['']);
  currentRoute = signal<string>(this.getRouteFromUrl(this.router.url));
  private routerSubscription?: Subscription;

  constructor() {
    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(this.getRouteFromUrl(event.url));
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private getRouteFromUrl(url: string): string {
    if (url.includes('/email')) return 'email';
    if (url.includes('/password')) return 'password';
    if (url.includes('/otp')) return 'otp';
    return '';
  }
}
