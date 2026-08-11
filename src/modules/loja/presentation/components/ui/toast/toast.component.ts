import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

// Porta Angular de `desing system/components/feedback/Toast.jsx`.
@Component({
    selector: 'ui-toast',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="ui-toast" [class]="tone">{{ message }}</div>`,
    styleUrl: './toast.component.css',
})
export class ToastComponent {
    @Input() message = '';
    @Input() tone: 'neutral' | 'success' | 'error' = 'neutral';
}
