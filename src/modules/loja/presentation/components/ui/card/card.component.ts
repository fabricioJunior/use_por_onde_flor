import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

// Porta Angular de `desing system/components/core/Card.jsx`.
@Component({
    selector: 'ui-card',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="ui-card" [class.elevated]="elevated"><ng-content></ng-content></div>`,
    styleUrl: './card.component.css',
})
export class CardComponent {
    @Input() elevated = false;
}
