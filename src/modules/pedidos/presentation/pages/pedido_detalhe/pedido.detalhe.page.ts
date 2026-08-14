import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { HeaderComponent } from "../../../../loja/presentation/components/header/header.component";
import { FooterComponent } from "../../../../loja/presentation/components/footer/footer.component";
import { AutenticacaoService } from "../../../../autenticacao/services/autenticacao.service";
import { PedidosService } from "../../../services/pedidos.service";
import { PedidoDetalheDto } from "../../../data/dto/pedido-detalhe.dto";
import { ToastService } from "../../../../loja/presentation/components/ui/toast/toast.service";

@Component({
    selector: 'pedido-detalhe-page',
    standalone: true,
    imports: [CommonModule, HeaderComponent, FooterComponent],
    templateUrl: './pedido.detalhe.page.html',
    styleUrl: './pedido.detalhe.page.css',
})
export class PedidoDetalhePage implements OnInit {
    loading = signal(true);
    naoEncontrado = signal(false);
    erro = signal(false);
    pedido = signal<PedidoDetalheDto | null>(null);
    pagamentoConcluido = signal(false);
    reenviandoEmail = signal(false);

    private id = 0;
    private token: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private pedidosService: PedidosService,
        private autenticacaoService: AutenticacaoService,
        private toastService: ToastService,
    ) { }

    async ngOnInit(): Promise<void> {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        const token = this.route.snapshot.queryParamMap.get('token');
        this.id = id;
        this.token = token;
        this.pagamentoConcluido.set(this.route.snapshot.queryParamMap.get('pago') === '1');

        try {
            // Link com token (pós-pagamento, compartilhável): busca pública, sem exigir login --
            // mesmo sem login válido, se o token bater é o dono do pedido (ver PedidoEntity.tokenAcesso).
            this.pedido.set(
                token
                    ? await this.pedidosService.buscarPublico(id, token)
                    : await this.pedidosService.buscar(id),
            );
        } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 404) {
                this.naoEncontrado.set(true);
            } else if (error instanceof HttpErrorResponse && error.status === 401 && !this.autenticacaoService.estaAutenticado()) {
                this.naoEncontrado.set(true);
            } else {
                this.erro.set(true);
            }
        } finally {
            this.loading.set(false);
        }
    }

    formatarPreco(valor: number | undefined): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    async reenviarEmail(): Promise<void> {
        this.reenviandoEmail.set(true);
        try {
            await this.pedidosService.reenviarEmail(this.id, this.token);
            this.toastService.show('E-mail reenviado com sucesso', 'success');
        } catch (error) {
            console.error('Erro ao reenviar e-mail do pedido', error);
            this.toastService.show('Não foi possível reenviar o e-mail. Tente novamente.', 'error');
        } finally {
            this.reenviandoEmail.set(false);
        }
    }
}
