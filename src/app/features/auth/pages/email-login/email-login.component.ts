
import { Component, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SharedModule } from '../../../../shared/shared.module';
import { AUTH_ROUTES } from '../../auth.constants';

@Component({
  selector: 'app-email-login',
  imports: [SharedModule],
  templateUrl: './email-login.component.html',
  styleUrl: './email-login.component.scss'
})
export class EmailLoginComponent {
  emailControl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  isLoading = signal(false);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  get isValid(): boolean {
    return this.emailControl.valid;
  }

  onSubmit() {
    if (!this.emailControl.valid) {
      this.emailControl.markAsTouched();
      return;
    }

    this.isLoading.set(true);
    
    this.authService.sendOtp(this.emailControl.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate([AUTH_ROUTES.PASSWORD], { 
          state: { email: this.emailControl.value } 
        });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.toastService.error('Failed to send verification code. Please try again.');
      }
    });
  }
}
