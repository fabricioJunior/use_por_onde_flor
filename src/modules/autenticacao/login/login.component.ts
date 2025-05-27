import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TextButtonComponent } from "../../core/common_components/text.button.component";
import { FilledButtonComponent } from "../../core/common_components/filled.button.component";
import { LogoComponent } from "../../core/common_components/logo.component";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmailComponent } from "./etapas/email/email.component";
import { SenhaComponent } from "./etapas/senha/senha.component";
import { Router } from '@angular/router';
@Component({
    selector: 'Login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    imports: [TextButtonComponent, FilledButtonComponent, LogoComponent, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, EmailComponent, SenhaComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class LoginComponent {
    title = 'Login';
    etapa = signal(Etapas.Email);
    buttoLabel = computed(() => {
        switch (this.etapa()) {
            case Etapas.Email:
                return 'Avançar';
            case Etapas.Senha:
                return 'Entrar';
        }
    });
    selectEmail = signal('');
    senha = '';
    emailValido = signal(false);
    loginEnable = signal(false);


    constructor(private router: Router) { }



    emailChange(email: string) {
        this.selectEmail.set(email.toString());
    }

    emailValida(valida: boolean) {
        this.emailValido.update(() => valida);
    }

    onAvancarTap() {
        console.log(this);
        this.etapa.update(() => Etapas.Senha);
    }

    onAjudaTap() {


    }
    abrirCadastro() {
        this.router.navigate(['/cadastro']); // Redireciona para a rota /cadastro
    }




}


enum Etapas {
    Email,
    Senha,
}