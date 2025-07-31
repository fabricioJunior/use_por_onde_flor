import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TextButtonComponent } from "../../core/common_components/text.button.component";
import { FilledButtonComponent } from "../../core/common_components/filled.button.component";
import { LogoComponent } from "../../core/common_components/logo.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmailComponent } from "./etapas/email/email.component";
import { LoginSenhaComponent } from "./etapas/senha/senha.component";
import { Router, RouterModule } from '@angular/router';
@Component({
    selector: 'Login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    imports: [TextButtonComponent, LogoComponent, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class LoginComponent {

    loginGroup = new FormGroup(
        {
            email: new FormControl('', [Validators.required, Validators.email]),
            senha: new FormControl('', [Validators.required, Validators.minLength(6)]),
        }
    );

    constructor(private router: Router) { }


    onAvancarTap() {
        this.router.navigate(['login', { outlets: { loginOutlet: ['stepSenha'] } }]);
    }

    onAjudaTap() {


    }



}


enum Etapas {
    Email,
    Senha,
}