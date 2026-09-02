import { Component, OnInit, signal } from "@angular/core";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";
import { CadastroProgressoComponent } from "../../progresso/cadastro.progresso.component";
import { PofLoaderComponent } from "../../../../core/common_components/pof_loader/pof.loader.component";
import { CadastroComponent } from "../../cadastro.component";
import { Route, Router } from "@angular/router";
import { AutenticacaoService } from "../../../services/autenticacao.service";
import { single } from "rxjs";

@Component({
    selector: 'app-informacoes-basicas',
    imports: [ReactiveFormsModule, FormsModule, NgxMaskDirective, FilledButtonComponent, CadastroProgressoComponent, PofLoaderComponent],
    templateUrl: './informacoes.basicas.component.html',
    styleUrl: './informacoes.basicas.component.scss',
    providers: [provideNgxMask()]
})

export class InformacoesBasicasComponent implements OnInit {

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
    ngOnInit(): void {
        if (!this.temDadosDeNomeValidos()) {
            this.router.navigate(['/cadastro']);
        }
    }

    private temDadosDeNomeValidos(): boolean {
        const nomeControl = this.formGroup.get('nome');
        const sobrenomeControl = this.formGroup.get('sobrenome');

        return !!nomeControl?.value
            && !!sobrenomeControl?.value
            && !nomeControl.invalid
            && !sobrenomeControl.invalid;
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
                this.router.navigate(['/cadastro/infoContato']);
            } else {
                this.loading.set(false);
                this.cpfError.set(value.mensagem);
                this.avancaEnable.set(false);
            }

        });
    }

}