import { Component, input, output } from '@angular/core';
import { PrimaryButtonComponent } from '../primary-button/primary-button.component';

@Component({
  selector: 'app-auth-form',
  imports: [PrimaryButtonComponent],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss'
})
export class AuthFormComponent {
  submitText = input<string>('Next');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  
  formSubmit = output<void>();

  onSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Form submitted, prevented default');
    if (!this.disabled() && !this.loading()) {
      this.formSubmit.emit();
    }
  }
}
