import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { FeedbackMessageComponent } from '../feedback-message/feedback-message.component';

@Component({
  selector: 'app-toast-container',
  imports: [FeedbackMessageComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  
  toasts = this.toastService.getToasts;

  onDismiss(id: number) {
    this.toastService.dismiss(id);
  }
}
