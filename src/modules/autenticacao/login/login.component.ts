import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
@Component({
    selector: 'Login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    imports: [TextButtonComponent, LogoComponent, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class LoginComponent implements OnInit {

    loginGroup = new FormGroup(
        {
            email: new FormControl('', [Validators.required, Validators.email]),
            senha: new FormControl('', [Validators.required, Validators.minLength(6)]),
        }
    );

    // URL pra onde voltar após login (ex: veio do checkout finalizar compra).
    returnUrl = signal<string | null>(null);

    constructor(private router: Router, private route: ActivatedRoute) { }
    ngOnInit(): void {
        this.returnUrl.set(this.route.snapshot.queryParamMap.get('returnUrl'));
    }


    onAvancarTap() {
        this.router.navigate(['login/stepSenha'])
    }

    onAjudaTap() {


    }



}


enum Etapas {
    Email,
    Senha,
}