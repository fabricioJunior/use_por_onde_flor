import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

// Porta Angular de `desing system/components/forms/Radio.jsx`. Uso: forma de entrega/pagamento
// (grupo simples checked/change controlado por quem consome, igual a spec original em React).
@Component({
    selector: 'ui-radio',
    standalone: true,
    imports: [CommonModule],
    template: `
        <label class="ui-radio" (click)="checked ? null : changed.emit()">
            <span class="dot" [class.checked]="checked">
                @if (checked) {
                    <span class="inner"></span>
                }
            </span>
            <ng-content></ng-content>
        </label>
    `,
    styleUrl: './radio.component.css',
})
export class RadioComponent {
    @Input() checked = false;
    @Output() changed = new EventEmitter<void>();
}
