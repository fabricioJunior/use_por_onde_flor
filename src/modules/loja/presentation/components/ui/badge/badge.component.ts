import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

// Porta Angular de `desing system/components/core/Badge.jsx`.
@Component({
    selector: 'ui-badge',
    standalone: true,
    imports: [CommonModule],
    template: `<span class="ui-badge" [class]="tone"><ng-content></ng-content></span>`,
    styleUrl: './badge.component.css',
})
export class BadgeComponent {
    @Input() tone: 'neutral' | 'brand' | 'inverse' = 'neutral';
}
