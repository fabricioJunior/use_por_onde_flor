import { CommonModule } from "@angular/common";
import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

// Porta Angular de `desing system/components/forms/Switch.jsx`.
@Component({
    selector: 'ui-switch',
    standalone: true,
    imports: [CommonModule],
    template: `
        <label class="ui-switch">
            <span class="track" [class.checked]="value" [class.disabled]="disabled" (click)="toggle()">
                <span class="thumb"></span>
            </span>
            @if (label) {
                <span>{{ label }}</span>
            }
        </label>
    `,
    styleUrl: './switch.component.css',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SwitchComponent), multi: true }],
})
export class SwitchComponent implements ControlValueAccessor {
    @Input() label?: string;

    value = false;
    disabled = false;

    private onChange: (value: boolean) => void = () => { };
    onTouched: () => void = () => { };

    toggle(): void {
        if (this.disabled) return;
        this.value = !this.value;
        this.onChange(this.value);
        this.onTouched();
    }

    writeValue(value: boolean): void {
        this.value = !!value;
    }

    registerOnChange(fn: (value: boolean) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
