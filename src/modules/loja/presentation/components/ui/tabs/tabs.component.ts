import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

export interface UiTab {
    value: string;
    label: string;
}

// Porta Angular de `desing system/components/navigation/Tabs.jsx`.
@Component({
    selector: 'ui-tabs',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="ui-tabs">
            @for (tab of tabs; track tab.value) {
                <button type="button" class="tab" [class.active]="tab.value === selected"
                    (click)="select(tab.value)">
                    {{ tab.label }}
                </button>
            }
        </div>
    `,
    styleUrl: './tabs.component.css',
})
export class TabsComponent {
    @Input() tabs: UiTab[] = [];
    @Input() selected = '';
    @Output() selectedChange = new EventEmitter<string>();

    select(value: string): void {
        if (value === this.selected) return;
        this.selected = value;
        this.selectedChange.emit(value);
    }
}
