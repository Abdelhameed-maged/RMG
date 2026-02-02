import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-auth-header',
  imports: [],
  templateUrl: './auth-header.component.html',
  styleUrl: './auth-header.component.scss'
})
export class AuthHeaderComponent {
  title = input<string>('');
  subTitle = input<string>('');
  titleCustomClasses = input<Array<string>>(['']);
  subTitleCustomClasses = input<Array<string>>(['']);
  allowHtml = input<boolean>(false);
  
  titleClasses = computed(() => `auth-title ${this.titleCustomClasses().join(' ')}`);
  subTitleClasses = computed(() => `auth-subtitle ${this.subTitleCustomClasses().join(' ')}`);
}
