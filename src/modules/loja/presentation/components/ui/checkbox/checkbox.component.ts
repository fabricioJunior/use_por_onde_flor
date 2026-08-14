import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

// Porta Angular de `desing system/components/forms/Checkbox.jsx`.
@Component({
    selector: 'ui-checkbox',
    standalone: true,
    imports: [CommonModule],
    template: `
        <label class="ui-checkbox" (click)="changed.emit(!checked)">
            <span class="box" [class.checked]="checked">
                @if (checked) {
                    <span class="check">✓</span>
                }
            </span>
            <ng-content></ng-content>
        </label>
    `,
    styleUrl: './checkbox.component.css',
})
export class CheckboxComponent {
    @Input() checked = false;
    @Output() changed = new EventEmitter<boolean>();
}
