import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-primary-button',
  imports: [CommonModule],
  templateUrl: './primary-button.component.html',
  styleUrl: './primary-button.component.scss'
})
export class PrimaryButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  
  clicked = output<MouseEvent>();

  classes = computed(() => {
    const classList = ['btn'];
    classList.push(`btn-${this.variant()}`);
    classList.push(`btn-${this.size()}`);
    if (this.fullWidth()) classList.push('btn-full-width');
    if (this.loading()) classList.push('btn-loading');
    return classList.join(' ');
  });

  onClick(event: MouseEvent) {
    if (this.type() === 'submit') {
      // Let the form handle submission via ngSubmit
      return;
    }
    
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
