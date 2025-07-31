import { ChangeDetectionStrategy, Component, Input, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule, Validators, FormsModule, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { merge, single } from "rxjs";
import { Output, EventEmitter } from '@angular/core';
import { LoginComponent } from "../../login.component";
import { Router } from "@angular/router";
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";
import { AutenticacaoService } from "../../../services/autenticacao.service";

@Component({
    selector: 'app-email',
    templateUrl: './email.component.html',
    styleUrls: ['./email.component.css'],
    imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, FilledButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailComponent {
    errorMessage = signal('');
    avancaEnable = signal(false);

    loginGroup: FormGroup;
    constructor(private router: Router, loginComponent: LoginComponent, private loginService: AutenticacaoService) {
        this.loginGroup = loginComponent.loginGroup;
        merge(loginComponent.loginGroup.get('email')!.statusChanges, this.loginGroup.get('email')!.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage());
    }

    updateErrorMessage() {
        if (this.loginGroup.get('email')!.hasError('required')) {
            this.errorMessage.set('Informe o email');
            this.avancaEnable.set(false);
        } else if (this.loginGroup.get('email')!.hasError('email')) {
            this.errorMessage.set('Informe um email válido');
            this.avancaEnable.set(false);
        } else {
            this.errorMessage.set('');
            this.avancaEnable.set(true);
        }

    }

    onAvancarTap() {

        this.loginService.validarEmailValido(this.loginGroup.get('email')?.value).subscribe((data) => {
            if (data.valido) {
                this.errorMessage.set('E-mail não cadastrado, verifique o e-mail inserido ou crie um conta');
            } else {
                this.errorMessage.set('');
                this.router.navigate(['login', { outlets: { loginOutlet: ['stepSenha'] } }]);

            }
        });
    }



    abrirCadastro() {
        this.router.navigate(['/cadastro']); // Redireciona para a rota /cadastro
    }


}