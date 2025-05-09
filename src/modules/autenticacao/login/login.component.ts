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
@Component({
    selector: 'Login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    imports: [TextButtonComponent, FilledButtonComponent, LogoComponent, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, EmailComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    avancaEnable = signal(false);
    readonly emailControl = new FormControl('', [Validators.required, Validators.email]);
    readonly senha = new FormControl('', [Validators.required, Validators.minLength(6)]);
    $event: any;


    avancaTap() {
        console.log('teste');
    }


    emailChange(email: string) {
        console.log(email.toString());

        this.emailControl.setValue(email);
        this.avancaEnable.set(this.emailControl.valid);

    }

    onAjudaTap() {

    }

    constructor() {

    }



}



enum Etapas {
    Email,
    Senha,
}