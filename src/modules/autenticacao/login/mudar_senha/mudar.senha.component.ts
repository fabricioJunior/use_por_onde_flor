import { ChangeDetectionStrategy, Component, computed, NgModule, OnInit, signal } from "@angular/core";
import { MatError, MatLabel, MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import { FilledButtonComponent } from "../../../core/common_components/filled.button.component";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { merge } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { AutenticacaoService } from "../../services/autenticacao.service";
import { MatInputModule } from "@angular/material/input";
import { NgOtpInputComponent } from 'ng-otp-input';
import { LogoComponent } from "../../../core/common_components/logo.component";

@Component({
    selector: 'app-cadastro',
    templateUrl: './mudar.senha.component.html',
    styleUrls: ['./mudar.senha.component.scss'],
    imports: [MatError, MatLabel, MatFormField, NgOtpInputComponent, FilledButtonComponent, MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, LogoComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class MudarSenhaComponent implements OnInit {


    otpConfig = {
        length: 6,
        allowNumbersOnly: true,
        containerClass: 'otp-container',
        inputStyles: {
            width: '40px',
            height: '40px',
            fontSize: '18px'
        }
    };

    voltarParaLogin() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }
    irParaPagindaDoCodigo() {
        console.log('navegar para pagina do codigo');
        this.router.navigate(['/login']);
    }

    errorMessageCode = signal('');
    errorMessageSenha = signal('');
    atualizarSenhaEnabled = signal(false);
    senhaAtualizadaComSucesso = signal(false);
    carregando = signal(false);

    senhaControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
    codigoControl = new FormControl('', [Validators.required, Validators.minLength(6)]);

    constructor(private autenticacaoService: AutenticacaoService, private router: Router, private route: ActivatedRoute) {

        merge(this.senhaControl.statusChanges, this.senhaControl.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateSenhaErrorMessage());
        merge(this.codigoControl.statusChanges, this.codigoControl.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateCodigoErrorMessage());
    }

    updateSenhaErrorMessage(): void {
        if (this.senhaControl!.hasError('required')) {
            this.errorMessageSenha.set('Informe a senha');
        } else if (this.senhaControl.hasError('minlength')) {
            this.errorMessageSenha.set('Informe um a senha com pelo menos 8 caracteres');
        } else {
            this.errorMessageSenha.set('');
        }
        this.atualizarBotaoHabilitado();
    }
    updateCodigoErrorMessage(): void {
        if (this.codigoControl!.hasError('required')) {
            this.errorMessageCode.set('Digite o codigo');
        } else {
            this.errorMessageCode.set('');
        }
        this.atualizarBotaoHabilitado();


    }

    atualizarBotaoHabilitado(): void {
        var result = this.senhaControl.valid && this.codigoControl.value?.length == 6;
        this.atualizarSenhaEnabled.set(result);
    }

    async atualizarSenha() {
        this.carregando.set(true);
        try {
            const result = await this.autenticacaoService.mudarSenha(this.senhaControl.value!, this.codigoControl.value!);
            if (result.sucesso) {
                this.senhaAtualizadaComSucesso.set(true);
            } else {
                this.errorMessageCode.set(result.mensagem || 'Erro ao atualizar a senha');
            }
        } catch (error) {
            console.error('Erro ao atualizar senha', error);
            this.errorMessageCode.set('Erro ao atualizar a senha. Tente novamente.');
        } finally {
            this.carregando.set(false);
        }
    }


    ngOnInit(): void {

    }







}
