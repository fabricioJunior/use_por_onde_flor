import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

// Porta Angular de `desing system/components/core/Button.jsx`. Variantes/tamanhos e tokens iguais.
@Component({
    selector: 'ui-button',
    standalone: true,
    imports: [CommonModule],
    template: `
        <button type="button" class="ui-button" [class]="variant + ' ' + size" [disabled]="disabled"
            (click)="disabled ? null : clicked.emit($event)">
            <ng-content></ng-content>
        </button>
    `,
    styleUrl: './button.component.css',
})
export class ButtonComponent {
    @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
    @Input() size: 'sm' | 'md' | 'lg' = 'md';
    @Input() disabled = false;
    @Output() clicked = new EventEmitter<Event>();
}
