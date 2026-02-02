import { Component, input, output, signal, viewChildren, ElementRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-input',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otp-input.component.html',
  styleUrl: './otp-input.component.scss'
})
export class OtpInputComponent {
  length = input<number>(6);
  formControl = input.required<FormControl>();
  label = input<string>('Enter OTP');
  
  otpComplete = output<string>();
  
  inputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');
  otpValues = signal<string[]>([]);

  ngOnInit() {
    this.otpValues.set(Array(this.length()).fill(''));
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Enforce digits-only
    value = value.replace(/\D/g, '');
    
    if (value.length > 1) {
      value = value.charAt(0);
    }

    input.value = value;

    const values = [...this.otpValues()];
    values[index] = value;
    this.otpValues.set(values);

    const otpString = values.join('');
    this.formControl().setValue(otpString);

    if (value && index < this.length() - 1) {
      this.focusInput(index + 1);
    }

    if (otpString.length === this.length() && !otpString.includes('')) {
      this.otpComplete.emit(otpString);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.focusInput(index - 1);
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
    }

    if (event.key === 'ArrowRight' && index < this.length() - 1) {
      event.preventDefault();
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const pastedChars = pastedData.slice(0, this.length()).split('');
    
    const values = [...this.otpValues()];
    pastedChars.forEach((char, i) => {
      if (/^[0-9]$/.test(char)) {
        values[i] = char;
      }
    });
    
    this.otpValues.set(values);
    const otpString = values.join('');
    this.formControl().setValue(otpString);

    const lastIndex = Math.min(pastedChars.length, this.length() - 1);
    this.focusInput(lastIndex);

    if (otpString.length === this.length() && !otpString.includes('')) {
      this.otpComplete.emit(otpString);
    }
  }

  private focusInput(index: number) {
    const inputElements = this.inputs();
    if (inputElements[index]) {
      inputElements[index].nativeElement.focus();
    }
  }

  getIndices(): number[] {
    return Array.from({ length: this.length() }, (_, i) => i);
  }
}
