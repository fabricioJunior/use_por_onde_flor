import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatProgressSpinner, MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FilledButtonComponent } from "../../core/common_components/filled.button.component";
import { LogoComponent } from "../../core/common_components/logo.component";
import { AutenticacaoService } from "../services/autenticacao.service";

@Component({
    selector: 'app-verificar-email',
    templateUrl: './verificar.email.component.html',
    styleUrls: ['./verificar.email.component.scss'],
    imports: [FilledButtonComponent, LogoComponent, MatProgressSpinner, MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class VerificarEmailComponent implements OnInit {

    carregando = signal(true);
    sucesso = signal(false);
    reenviando = signal(false);
    reenviado = signal(false);
    mensagemErro = signal('');

    constructor(
        private autenticacaoService: AutenticacaoService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {
        const token = this.route.snapshot.queryParamMap.get('token');
        if (!token) {
            this.carregando.set(false);
            this.mensagemErro.set('Link inválido: token de verificação não encontrado.');
            return;
        }
        this.confirmarEmail(token);
    }

    private async confirmarEmail(token: string) {
        this.carregando.set(true);
        this.mensagemErro.set('');
        try {
            const result = await this.autenticacaoService.confirmarEmail(token);
            if (result.sucesso) {
                this.sucesso.set(true);
            } else {
                this.mensagemErro.set(result.mensagem || 'Não foi possível verificar seu e-mail.');
            }
        } catch (error) {
            console.error('Erro ao confirmar e-mail', error);
            this.mensagemErro.set('Não foi possível verificar seu e-mail. O link pode ter expirado.');
        } finally {
            this.carregando.set(false);
        }
    }

    async reenviarConfirmacao() {
        this.reenviando.set(true);
        this.reenviado.set(false);
        try {
            const result = await this.autenticacaoService.reenviarConfirmacaoDeEmail();
            if (result.sucesso) {
                this.reenviado.set(true);
                this.mensagemErro.set('');
            } else {
                this.mensagemErro.set(result.mensagem || 'Erro ao reenviar e-mail de confirmação.');
            }
        } catch (error) {
            console.error('Erro ao reenviar confirmação de e-mail', error);
            this.mensagemErro.set('Erro ao reenviar e-mail de confirmação. Tente novamente.');
        } finally {
            this.reenviando.set(false);
        }
    }

    irParaLoja() {
        this.router.navigateByUrl('/loja');
    }
}
