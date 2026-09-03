import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AutenticacaoService } from "../../services/autenticacao.service";
import { FilledButtonComponent } from "../../../core/common_components/filled.button.component";
import { LogoComponent } from "../../../core/common_components/logo.component";

@Component({
    selector: 'app-email-pendente',
    templateUrl: './email.pendente.component.html',
    styleUrls: ['../mudar_senha/mudar.senha.component.scss'],
    imports: [FilledButtonComponent, LogoComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class EmailPendenteComponent {

    reenviando = signal(false);
    reenviado = signal(false);
    errorMessage = signal('');

    constructor(private autenticacaoService: AutenticacaoService, private router: Router) { }

    async reenviarEmail() {
        if (this.reenviado() || this.reenviando()) {
            return;
        }
        this.reenviando.set(true);
        try {
            await this.autenticacaoService.reenviarConfirmacaoDeEmail();
        } catch (error) {
            console.error('Erro ao reenviar e-mail de verificação', error);
        } finally {
            this.reenviando.set(false);
            this.reenviado.set(true);
        }
    }

    irParaLogin() {
        this.router.navigate(['/login']);
    }
}
