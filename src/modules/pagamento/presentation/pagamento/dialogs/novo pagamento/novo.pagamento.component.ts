import { Component } from "@angular/core";
import { PagamentoService } from "../../../../services/pagamento.service";
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { NgxMaskDirective, NgxMaskPipe } from "ngx-mask";
import { MatButtonModule } from "@angular/material/button";

import { CommonModule } from "@angular/common";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";

@Component({
    selector: 'novo-pagamento',
    templateUrl: './novo.pagamento.component.html',
    styleUrls: ['./novo.pagamento.component.scss'],
    imports: [MatFormField, MatLabel, MatError, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, NgxMaskDirective, MatButtonModule, CommonModule]

})
export class NovoPagamentoComponent {
    novoPagamentoForm?: FormGroup;


    constructor(private bottomSheetRef: MatBottomSheetRef<NovoPagamentoComponent>, private pagamentoService: PagamentoService) {
        this.novoPagamentoForm =
            new FormGroup({
                valor: new FormControl(['', Validators.required]),
                instagram: new FormControl(['']),
                telefone: new FormControl([''])

            },
                {
                    validators: instagramOrTelefoneValidator
                }
            );

    }


    async onSubmit() {

        if (this.novoPagamentoForm!.valid) {
            var valor = this.novoPagamentoForm?.get('valor')?.value;
            var instagram = this.novoPagamentoForm?.get('instagram')?.value;
            var telefone = this.novoPagamentoForm?.get('telefone')?.value;
            var orderNsu = await this.pagamentoService.getPagamentoNovo(valor, instagram, telefone);
            this.bottomSheetRef.dismiss(
                {
                    orderNsu: orderNsu
                }
            );
        }
    }



}

export const instagramOrTelefoneValidator: ValidatorFn = (
    control: AbstractControl,
): ValidationErrors | null => {
    const instagram = control.get('instagram')?.value;
    const telefone = control.get('telefone')?.value;
    if (!instagram && !telefone) {
        return { contatoObrigatorio: true };
    }
    return null;
};

