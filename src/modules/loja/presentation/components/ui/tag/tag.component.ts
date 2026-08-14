import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";

// Porta Angular de `desing system/components/core/Tag.jsx`.
@Component({
    selector: 'ui-tag',
    standalone: true,
    imports: [CommonModule],
    template: `
        <span class="ui-tag">
            <ng-content></ng-content>
            <button type="button" class="remove" aria-label="Remover" (click)="removed.emit()">×</button>
        </span>
    `,
    styleUrl: './tag.component.css',
})
export class TagComponent {
    @Output() removed = new EventEmitter<void>();
}
