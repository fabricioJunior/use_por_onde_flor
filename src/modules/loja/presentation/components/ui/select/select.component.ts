import { CommonModule } from "@angular/common";
import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export interface UiSelectOption {
    value: string;
    label: string;
}

// Porta Angular de `desing system/components/forms/Select.jsx`.
@Component({
    selector: 'ui-select',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="ui-select-wrapper">
            @if (label) {
                <label [for]="id">{{ label }}</label>
            }
            <select [id]="id" [value]="value" [disabled]="disabled"
                (change)="onSelect($event)" (blur)="onTouched()">
                @for (opt of options; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                }
            </select>
        </div>
    `,
    styleUrl: './select.component.css',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }],
})
export class SelectComponent implements ControlValueAccessor {
    @Input() label?: string;
    @Input() options: UiSelectOption[] = [];
    @Input() id = `ui-select-${Math.random().toString(36).slice(2)}`;

    value = '';
    disabled = false;

    private onChange: (value: string) => void = () => { };
    onTouched: () => void = () => { };

    onSelect(event: Event): void {
        this.value = (event.target as HTMLSelectElement).value;
        this.onChange(this.value);
    }

    writeValue(value: string): void {
        this.value = value ?? '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
