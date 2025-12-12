import { ChangeDetectionStrategy, Component, NgModule, OnInit, signal } from "@angular/core";
import { MatError, MatLabel, MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import { FilledButtonComponent } from "../../../core/common_components/filled.button.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { sign } from "crypto";
import { merge } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { AutenticacaoService } from "../../services/autenticacao.service";
import { MatInputModule } from "@angular/material/input";
import { LoginComponent } from "../login.component";
import { MatProgressSpinner, MatProgressSpinnerModule } from "@angular/material/progress-spinner";



@Component({
    selector: 'app-cadastro',
    templateUrl: './recuperar.senha.component.html',
    styleUrls: ['./recuperar.senha.component.scss'],
    imports: [MatError, MatLabel, MatFormField, FilledButtonComponent, MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, MatProgressSpinner, MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class RecuperarSenhaComponent implements OnInit {
    voltarParaLogin() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }
    irParaPagindaDoCodigo() {
        console.log('navegar para pagina do codigo');
        this.router.navigate(['/mudarSenha']);
    }

    errorMessage = signal('');
    avancaEnable = signal(false);
    emailDeRecuperacaoEnviado = signal(false);
    carregando = signal(false);

    emailControl: FormControl;
    loginGroup: FormGroup;

    constructor(loginComponent: LoginComponent, private autenticacaoService: AutenticacaoService, private router: Router, private route: ActivatedRoute) {
        this.loginGroup = loginComponent.loginGroup;
        this.emailControl = loginComponent.loginGroup.get('email') as FormControl;
        this.updateErrorMessage();
        merge(this.emailControl.statusChanges, this.emailControl.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage());
    }
    updateErrorMessage(): void {
        if (this.emailControl!.hasError('required')) {
            this.errorMessage.set('Informe o email');
            this.avancaEnable.set(false);
        } else if (this.emailControl.hasError('email')) {
            this.errorMessage.set('Informe um email válido');
            this.avancaEnable.set(false);
        } else {
            this.errorMessage.set('');
            this.avancaEnable.set(true);
        }
    }


    ngOnInit(): void {

    }




    onEmailInput($event: Event) {

    }

    async solicitarRedefinicaoDeSenha() {
        this.carregando.set(true);
        this.autenticacaoService.solicitaEsqueciSenha(this.emailControl.value!).then((result) => {
            if (result.sucesso) {
                this.emailDeRecuperacaoEnviado.set(true);
            }

        });
    }

    irParaParaRecuperacao() {
        //TODO: Implementar lógica de verificação de email antes de navegar
        //TODO: Implementar pagina

        this.router.navigate(['/recuperarEmail']);
    }




}