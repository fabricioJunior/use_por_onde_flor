import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { merge } from "rxjs";
import { LoginComponent } from "../../login.component";
import { AutenticacaoService } from "../../../services/autenticacao.service";
import { Router } from "@angular/router";
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";

@Component({
    selector: 'app-senha',
    templateUrl: './senha.component.html',
    styleUrls: ['./senha.component.css'],
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, FilledButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginSenhaComponent implements OnInit {



    errorMessage = signal('');
    avancaEnable = signal(false);


    formGroup: FormGroup;
    constructor(private loginComponent: LoginComponent, private loginService: AutenticacaoService, private router: Router) {
        this.formGroup = loginComponent.loginGroup;

        merge(this.formGroup.get('senha')!.statusChanges, this.formGroup.get('senha')!.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage());
    }
    ngOnInit(): void {
        if (this.formGroup.get('email')?.invalid) {
            this.router.navigate(['login']);
        }
    }

    updateErrorMessage() {
        if (this.formGroup.get('senha')!.hasError('required')) {
            this.errorMessage.set('Informe a senha');
            this.avancaEnable.set(false);
        } else if (this.formGroup.get('senha')!.hasError('minlength')) {
            this.errorMessage.set('Sua senha deve ter no mínimo 6 caracteres');
            this.avancaEnable.set(false);
        } else {
            this.avancaEnable.set(true);
            this.errorMessage.set('');
        }
    }

    onEsqueceuSenha() {
        console.log('esqueceu senha');
        this.router.navigate(['login/recuperarSenha']);
    }

    trocarEmail() {
        this.router.navigate(['login']);
    }

    async login() {
        var sucess = await this.loginService.fazerLogin(
            this.formGroup.get('email')?.value,
            this.formGroup.get('senha')?.value,
        );
        if (sucess) {
            if (!this.loginService.emailVerificadoDaSessao()) {
                this.router.navigate(['/email-pendente']);
                return;
            }
            this.router.navigateByUrl(this.loginComponent.returnUrl() ?? '/loja');
        } else {
            this.errorMessage.set('Senha incorreta, tente novamente');
        }
    }


}