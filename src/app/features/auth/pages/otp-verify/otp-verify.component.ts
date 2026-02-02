import { Component, signal, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { AUTH_ROUTES } from '../../auth.constants';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-otp-verify',
  imports: [SharedModule],
  templateUrl: './otp-verify.component.html',
  styleUrl: './otp-verify.component.scss'
})
export class OtpVerifyComponent {
  otpControl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] });
  isLoading = signal(false);
  isResending = signal(false);
  email = signal('');

  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const emailFromState = navigation?.extras?.state?.['email'] || '';
    this.email.set(emailFromState);
    
    if (!emailFromState) {
      this.router.navigate([AUTH_ROUTES.EMAIL]);
    }
  }

  get isValid(): boolean {
    return this.otpControl.valid;
  }

  onOtpComplete(otp: string) {
    this.otpControl.setValue(otp);
    this.onSubmit();
  }

  onSubmit() {
    if (!this.otpControl.valid) {
      this.otpControl.markAsTouched();
      return;
    }

    this.isLoading.set(true);
    
    this.authService.verifyOtp(this.email(), this.otpControl.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.toastService.error('Invalid verification code. Please try again.');
      }
    });
  }

  resendOtp() {
    this.isResending.set(true);
    
    this.authService.sendOtp(this.email()).subscribe({
      next: () => {
        this.isResending.set(false);
        this.toastService.success('Code sent successfully!');
      },
      error: (error) => {
        this.isResending.set(false);
        this.toastService.error('Failed to send code. Please try again.');
      }
    });
  }

  goBack() {
    this.router.navigate([AUTH_ROUTES.PASSWORD], { 
      state: { email: this.email() } 
    });
  }
}
