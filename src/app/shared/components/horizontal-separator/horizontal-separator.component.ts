import { Component, input } from '@angular/core';

@Component({
  selector: 'app-horizontal-separator',
  imports: [],
  templateUrl: './horizontal-separator.component.html',
  styleUrl: './horizontal-separator.component.scss'
})
export class HorizontalSeparatorComponent {
  label = input<string>('');

}
