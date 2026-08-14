import { CommonModule } from "@angular/common";
import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

// Porta Angular de `desing system/components/forms/Input.jsx`. Mesmos tokens/estados (erro/helper).
@Component({
    selector: 'ui-input',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="ui-input-wrapper">
            @if (label) {
                <label [for]="id">{{ label }}</label>
            }
            <input [id]="id" [type]="type" [placeholder]="placeholder" [class.error]="!!error"
                [value]="value" [disabled]="disabled"
                (input)="onInput($event)" (blur)="onTouched()" />
            @if (error || helper) {
                <span class="helper" [class.error]="!!error">{{ error || helper }}</span>
            }
        </div>
    `,
    styleUrl: './input.component.css',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true }],
})
export class InputComponent implements ControlValueAccessor {
    @Input() label?: string;
    @Input() placeholder = '';
    @Input() helper?: string;
    @Input() error?: string;
    @Input() type = 'text';
    @Input() id = `ui-input-${Math.random().toString(36).slice(2)}`;

    value = '';
    disabled = false;

    private onChange: (value: string) => void = () => { };
    onTouched: () => void = () => { };

    onInput(event: Event): void {
        this.value = (event.target as HTMLInputElement).value;
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
