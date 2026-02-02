import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private isAuthenticatedSignal = signal(false);
  private userSignal = signal<User | null>(null);
  private http = inject(HttpClient);
  private router = inject(Router);

  isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  user = this.userSignal.asReadonly();

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      this.isAuthenticatedSignal.set(true);
      this.userSignal.set(JSON.parse(userStr));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Simulate authentication by checking against users in db.json
    return this.http.get<User[]>(`${this.API_URL}/users?email=${credentials.email}&password=${credentials.password}`).pipe(
      map(users => {
        if (users.length > 0) {
          const user = users[0];
          const token = btoa(`${user.email}:${Date.now()}`); // Simple token generation
          const authResponse: AuthResponse = { token, user };
          
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(user));
          this.isAuthenticatedSignal.set(true);
          this.userSignal.set(user);
          
          return authResponse;
        }
        throw new Error('Invalid credentials');
      }),
      catchError(error => {
        throw new Error('Authentication failed');
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.isAuthenticatedSignal.set(false);
    this.userSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getCurrentUser(): User | null {
    return this.userSignal();
  }
}
