import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

export interface SidebarLink {
  label: string;
  icon?: string;
  route?: string;
  children?: SidebarLink[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  links = input<SidebarLink[]>([]);
  collapsed = input<boolean>(false);
  
  expandedItems = signal<Set<string>>(new Set());

  toggleExpand(label: string) {
    const expanded = new Set(this.expandedItems());
    if (expanded.has(label)) {
      expanded.delete(label);
    } else {
      expanded.add(label);
    }
    this.expandedItems.set(expanded);
  }

  isExpanded(label: string): boolean {
    return this.expandedItems().has(label);
  }

  hasChildren(link: SidebarLink): boolean {
    return !!link.children && link.children.length > 0;
  }
}
