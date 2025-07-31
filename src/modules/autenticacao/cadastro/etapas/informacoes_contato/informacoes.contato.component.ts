import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
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
export class InformacoesContatoComponent {

    loading = signal(false);

    emailError = signal('');

    avancaEnable(): boolean {
        return true;
    }
    onAvancarTap() {
        this.loginService.validarEmailValido(this.formGroup.get('email')?.value).subscribe((value) => {
            this.loading.set(true);
            if (value.valido) {
                this.router.navigate(['/cadastro', { outlets: { cadastroOutlet: ['senha'] } }]);
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
