import { Component } from '@angular/core';
import { MatDialogContent } from "@angular/material/dialog";
import { MatDialogActions } from "../../../../../../node_modules/@angular/material/dialog/index";

@Component({
    selector: 'confirm-cancel-dialog',
    template: `
    <h2 mat-dialog-title>Confirmar cancelamento</h2>
    <mat-dialog-content>Tem certeza que deseja cancelar o pagamento?</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close="false">Não</button>
      <button mat-button color="warn" mat-dialog-close="true">Sim</button>
    </mat-dialog-actions>
  `,
    imports: [MatDialogContent, MatDialogActions]
})
export class ConfirmCancelDialogComponent { }