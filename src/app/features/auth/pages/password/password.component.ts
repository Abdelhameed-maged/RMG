import { Component, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SharedModule } from '../../../../shared/shared.module';
import { AUTH_ROUTES } from '../../auth.constants';

@Component({
  selector: 'app-password',
  imports: [SharedModule],
  templateUrl: './password.component.html'
})
export class PasswordComponent {
  passwordControl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] });
  isLoading = signal(false);
  email = signal('');

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const emailFromState = navigation?.extras?.state?.['email'] || '';
    this.email.set(emailFromState);
    
    if (!emailFromState) {
      this.router.navigate([AUTH_ROUTES.EMAIL]);
    }
  }

  get isValid(): boolean {
    return this.passwordControl.valid;
  }

  onSubmit() {
    if (!this.passwordControl.valid) {
      this.passwordControl.markAsTouched();
      return;
    }

    this.isLoading.set(true);
    
    this.authService.login(this.email(), this.passwordControl.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate([AUTH_ROUTES.OTP], { 
          state: { email: this.email() } 
        });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.toastService.error('Invalid password. Please try again.');
      }
    });
  }

  forgetPassword() {
    // TODO: Implement forgot password flow
    this.toastService.info('This feature is coming soon');
  }
}
