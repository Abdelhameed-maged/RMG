import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  imports: [CommonModule],
  template: `
    <span 
      class="icon-wrapper" 
      [style.width]="size.width" 
      [style.height]="size.height"
      [innerHTML]="svgContent">
    </span>
  `,
  styles: [`
    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      
      :deep(svg) {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
  `]
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: {width: string, height: string} = {width: '24px', height: '24px'};
  @Input() color?: string;

  svgContent: SafeHtml = '';
  
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.loadSvg();
  }

  ngOnChanges() {
    this.loadSvg();
  }

  private loadSvg(): void {
    if (!this.name) return;

    const svgPath = `/assets/${this.name}.svg`;
    
    this.http.get(svgPath, { responseType: 'text' }).subscribe({
      next: (svg) => {
        let modifiedSvg = svg;
        
        // Apply color if provided
        if (this.color) {
          // Add fill or stroke attribute to the SVG
          modifiedSvg = svg.replace('<svg', `<svg fill="${this.color}"`);
        }
        
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(modifiedSvg);
      },
      error: (err) => {
        console.error(`Failed to load icon: ${this.name}`, err);
      }
    });
  }
}
