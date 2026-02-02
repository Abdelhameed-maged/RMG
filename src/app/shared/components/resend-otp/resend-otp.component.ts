import { Component, input, output, signal } from '@angular/core';
import { PrimaryButtonComponent } from '../primary-button/primary-button.component';

@Component({
  selector: 'app-resend-otp',
  imports: [PrimaryButtonComponent],
  templateUrl: './resend-otp.component.html',
  styleUrl: './resend-otp.component.scss'
})
export class ResendOtpComponent {
  isResending = input<boolean>(false);
  
  resendClicked = output<void>();

  onResendClick() {
    this.resendClicked.emit();
  }
}
