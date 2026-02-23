import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { NgxMaskDirective } from "ngx-mask";
import { CadastroComponent } from "../../cadastro.component";
import { NgxMaskConfig } from 'ngx-mask'
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";
import { AutenticacaoService } from "../../../services/autenticacao.service";
import { Router } from "@angular/router";



@Component({
    selector: 'app-informacoes-basicas',
    templateUrl: './informacoes.contato.component.html',
    styleUrls: ['./informacoes.contato.component.scss'],
    imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, MatSelectModule, NgxMaskDirective, NgxMaskDirective, FilledButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class InformacoesContatoComponent implements OnInit {

    loading = signal(false);

    emailError = signal('');

    avancaEnable(): boolean {
        return true;
    }
    onAvancarTap() {
        this.loginService.validarEmailValido(this.formGroup.get('email')?.value).subscribe((value) => {
            this.loading.set(true);
            if (value.valido) {
                this.router.navigate(['/cadastro/senha']);
            } else {
                console.log(value);
                this.loading.set(false);
                this.emailError.set(value.mensagem);
            }
        });

    }

    formGroup: FormGroup;

    constructor(cadastroComponent: CadastroComponent, private loginService: AutenticacaoService, private router: Router) {
        this.formGroup = cadastroComponent.cadastroFromGroup;
        this.formGroup.get('email')!.statusChanges.subscribe((value) => {
            this.atualizarErrorEmail();
        });

    }
    ngOnInit(): void {
        if (!this.temDadosBasicosValidos()) {
            this.router.navigate(['/cadastro']);
        }
    }

    private temDadosBasicosValidos(): boolean {
        const nomeControl = this.formGroup.get('nome');
        const sobrenomeControl = this.formGroup.get('sobrenome');
        const diaControl = this.formGroup.get('dia');
        const mesControl = this.formGroup.get('mes');
        const anoControl = this.formGroup.get('ano');
        const cpfControl = this.formGroup.get('cpf');

        return !!nomeControl?.value
            && !!sobrenomeControl?.value
            && !!diaControl?.value
            && !!mesControl?.value
            && !!anoControl?.value
            && !!cpfControl?.value
            && !nomeControl.invalid
            && !sobrenomeControl.invalid
            && !diaControl.invalid
            && !mesControl.invalid
            && !anoControl.invalid
            && !cpfControl.invalid;
    }

    atualizarErrorEmail() {
        var cpfInvalid = this.formGroup.get('email')?.invalid;
        if (cpfInvalid) {
            this.emailError.set('Informe um E-mail válido');
        } else {

            this.emailError.set('');
        }
    }

    emailFormControl(): FormControl {
        return this.formGroup.get('email') as FormControl;
    }

    telefoneFormControl(): FormControl {
        return this.formGroup.get('telefone') as FormControl;
    }
}
