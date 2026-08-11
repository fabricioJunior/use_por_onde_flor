import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface UiDialogData {
    title?: string;
    body?: string;
}

// Porta Angular de `desing system/components/overlays/Dialog.jsx`.
// Casco visual: mecânica de abrir/fechar/backdrop/teclado fica por conta do MatDialog.
// Uso: this.dialog.open(DialogComponent, { data: { title, body } })
@Component({
    selector: 'ui-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="ui-dialog">
            @if (data?.title) {
                <div class="title">{{ data.title }}</div>
            }
            <div class="body">
                <ng-content>{{ data?.body }}</ng-content>
            </div>
            <div class="actions">
                <ng-content select="[dialog-actions]"></ng-content>
            </div>
        </div>
    `,
    styleUrl: './dialog.component.css',
})
export class DialogComponent {
    constructor(
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UiDialogData,
    ) { }
}
