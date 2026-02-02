import { Component, input, computed } from '@angular/core';

export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-feedback-message',
  imports: [],
  templateUrl: './feedback-message.component.html',
  styleUrl: './feedback-message.component.scss'
})
export class FeedbackMessageComponent {
  message = input.required<string>();
  type = input<FeedbackType>('info');
  
  classes = computed(() => {
    return `feedback-toaster feedback-${this.type()}`;
  });
}
