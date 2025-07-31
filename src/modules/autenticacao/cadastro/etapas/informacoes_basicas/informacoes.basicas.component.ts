import { Component, signal } from "@angular/core";
import { MatSelectModule } from '@angular/material/select';
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";
import { CadastroComponent } from "../../cadastro.component";
import { Route, Router } from "@angular/router";
import { AutenticacaoService } from "../../../services/autenticacao.service";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { single } from "rxjs";

@Component({
    selector: 'app-informacoes-basicas',
    imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, MatSelectModule, NgxMaskDirective, FilledButtonComponent, MatProgressSpinnerModule],
    templateUrl: './informacoes.basicas.component.html',
    styleUrl: './informacoes.basicas.component.scss',
    providers: [provideNgxMask()]
})

export class InformacoesBasicasComponent {

    formGroup: FormGroup;

    dataError = signal('');
    cpfError = signal('');

    loading = signal(false);

    avancaEnable = signal(false);

    constructor(cadastroComponent: CadastroComponent, private router: Router, private loginService: AutenticacaoService) {
        this.formGroup = cadastroComponent.cadastroFromGroup;

        this.formGroup.statusChanges.subscribe((value) => {
            this.atualizarAvancaEnable();
        });
        this.formGroup.get('dia')!.statusChanges.subscribe((value) => {
            this.atualizarErrorEmData();

        });
        this.formGroup.get('mes')!.statusChanges.subscribe((value) => {
            this.atualizarErrorEmData();
        });
        this.formGroup.get('ano')!.statusChanges.subscribe((value) => {
            this.atualizarErrorEmData();
        });
        this.formGroup.get('cpf')!.statusChanges.subscribe((value) => {
            this.atualizarErrorEmCpf();
        });
    }

    atualizarErrorEmData() {
        var anoInvalid = this.formGroup.get('ano')?.invalid;
        var mesInvalid = this.formGroup.get('mes')?.invalid;
        var diaInvalid = this.formGroup.get('dia')?.invalid;
        if (anoInvalid || mesInvalid || diaInvalid) {
            this.dataError.set('Informe uma data válida');
        } else {
            this.dataError.set('');
        }
    }

    atualizarErrorEmCpf() {
        var cpfInvalid = this.formGroup.get('cpf')?.invalid;
        if (cpfInvalid) {
            this.cpfError.set('Informe um CPF inválido');
        } else {
            this.cpfError.set('');
        }
    }

    atualizarAvancaEnable() {
        var anoInvalid = this.formGroup.get('ano')?.invalid;
        var mesInvalid = this.formGroup.get('mes')?.invalid;
        var diaInvalid = this.formGroup.get('dia')?.invalid;
        var cpfInvalid = this.formGroup.get('cpf')?.invalid;
        if (anoInvalid || mesInvalid || diaInvalid || cpfInvalid) {
            this.avancaEnable.set(false);
        } else {
            this.avancaEnable.set(true);
        }
    }

    async onAvancarTap() {
        this.loading.set(true);
        this.loginService.validarDocumentoValido(this.formGroup.get('cpf')?.value).subscribe((value) => {
            if (value.valido) {
                this.router.navigate(['/cadastro', { outlets: { cadastroOutlet: ['infoContato'] } }]);
            } else {
                this.loading.set(false);
                this.cpfError.set(value.mensagem);
                this.avancaEnable.set(false);
            }

        });
    }

}