import { Component, input, output, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../primary-button/primary-button.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-form-field',
  imports: [ReactiveFormsModule, CommonModule, PrimaryButtonComponent, IconComponent],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss'
})
export class FormFieldComponent {
  label = input<string>('');
  placeholder = input<string>('');
  formControl = input.required<FormControl>();
  type = input<string>('text');
  
  showPassword = signal(false);
  
  inputType = computed(() => {
    if (this.type() === 'password' && this.showPassword()) {
      return 'text';
    }
    return this.type();
  });
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  errorMessages = input<Record<string, string>>({
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'Input is too short',
    maxlength: 'Input is too long',
    pattern: 'Invalid format'
  });
  labelAction = input<null | (() => void)>(null);
  labelActionText = input<string>('');
  inputEvent = output<Event>();

  onInput(event: Event) {
    this.inputEvent.emit(event);
  }

  getErrorMessage(): string {
    const control = this.formControl();
    if (control.errors && (control.touched || control.dirty)) {
      const firstError = Object.keys(control.errors)[0];
      const messages = this.errorMessages();
      return messages[firstError] || 'Invalid input';
    }
    return '';
  }

  shouldShowError(): boolean {
    const control = this.formControl();
    return !!(control.errors && (control.touched || control.dirty));
  }
  
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
}
