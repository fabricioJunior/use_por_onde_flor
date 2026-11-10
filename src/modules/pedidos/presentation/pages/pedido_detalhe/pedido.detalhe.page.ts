import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { HeaderComponent } from "../../../../loja/presentation/components/header/header.component";
import { FooterComponent } from "../../../../loja/presentation/components/footer/footer.component";
import { AutenticacaoService } from "../../../../autenticacao/services/autenticacao.service";
import { PedidosService } from "../../../services/pedidos.service";
import { OpcaoPagamentoPublicoDto, OpcoesPagamentoPublicoDto, PedidoDetalheDto, PedidoPagamentoCobrancaDto } from "../../../data/dto/pedido-detalhe.dto";
import { ToastService } from "../../../../loja/presentation/components/ui/toast/toast.service";
import { pedidoFoiEntregue, situacaoPedidoLabel } from "../../../utils/pedido-situacao.util";
import { descricaoVariacao } from "../../../../loja/presentation/utils/variacao-apresentacao.util";
import { MetaPixelService } from "../../../../core/meta-pixel/meta-pixel.service";

@Component({
    selector: 'pedido-detalhe-page',
    standalone: true,
    imports: [CommonModule, HeaderComponent, FooterComponent, ClipboardModule],
    templateUrl: './pedido.detalhe.page.html',
    styleUrl: './pedido.detalhe.page.css',
})
export class PedidoDetalhePage implements OnInit {
    descricaoVariacao = descricaoVariacao;
    loading = signal(true);
    naoEncontrado = signal(false);
    erro = signal(false);
    pedido = signal<PedidoDetalheDto | null>(null);
    pagamentoConcluido = signal(false);
    reenviandoEmail = signal(false);
    // Escolha da forma de pagamento pelo link (só com token). Sem opções = pedido que não aceita pagar por aqui (pago, cancelado...).
    opcoesPagamento = signal<OpcoesPagamentoPublicoDto | null>(null);
    escolhendoForma = signal(false);
    mostrandoOutrasFormas = signal(false);

    private id = 0;
    private token: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private pedidosService: PedidosService,
        private autenticacaoService: AutenticacaoService,
        private toastService: ToastService,
        private metaPixel: MetaPixelService,
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

            // Purchase do Pixel só no retorno do pagamento (?pago=1) E se o backend confirmar o pagamento: o
            // evento usa o mesmo event_id do envio server-side (deduplicação). A URL sozinha não prova venda.
            if (this.pagamentoConcluido() && token) {
                void this.metaPixel.purchaseDoPedido(id, token);
            }

            await this.carregarOpcoesPagamento();
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

    situacaoLabel(situacao: string | undefined): string {
        return situacaoPedidoLabel(situacao);
    }

    foiEntregue(pedido: PedidoDetalheDto): boolean {
        return pedidoFoiEntregue(pedido.situacaoEntrega, pedido.retiradoEm);
    }

    private async carregarOpcoesPagamento(): Promise<void> {
        if (!this.token) {
            return;
        }
        try {
            const opcoes = await this.pedidosService.opcoesPagamento(this.id, this.token);
            this.opcoesPagamento.set(opcoes.formas.length ? opcoes : null);
        } catch {
            // 400 = pedido pago/cancelado/parcial: simplesmente não oferece escolha.
            this.opcoesPagamento.set(null);
        }
    }

    temCobrancaPendente(pedido: PedidoDetalheDto): boolean {
        return !!pedido.pagamentos?.some((pagamento) => !pagamento.confirmadoEm && pagamento.cobranca);
    }

    // O desconto combinado com o vendedor só vale para a forma que ele definiu; trocar de forma o remove (o backend zera).
    perdeDescontoAoTrocar(): boolean {
        return !!this.opcoesPagamento()?.formas.some((forma) => forma.definidaPeloVendedor && forma.desconto > 0);
    }

    private cobrancaPendenteDaForma(formaDePagamentoId: number): PedidoPagamentoCobrancaDto | undefined {
        return this.pedido()?.pagamentos?.find(
            (pagamento) =>
                !pagamento.confirmadoEm &&
                pagamento.estoqueDisponivel !== false &&
                !!pagamento.cobranca &&
                pagamento.formaDePagamento?.id === formaDePagamentoId,
        )?.cobranca;
    }

    async escolherForma(forma: OpcaoPagamentoPublicoDto): Promise<void> {
        if (!this.token || this.escolhendoForma()) {
            return;
        }
        this.escolhendoForma.set(true);
        try {
            // Já existe cobrança pendente nessa mesma forma: não cria outra no gateway, só retoma a atual
            // (com link, leva ao gateway; Pix já mostra QR Code/código na própria página).
            const cobrancaAtual = this.cobrancaPendenteDaForma(forma.formaDePagamentoId);
            if (cobrancaAtual) {
                if (cobrancaAtual.urlDePagamento) {
                    window.location.assign(cobrancaAtual.urlDePagamento);
                    return;
                }
                this.mostrandoOutrasFormas.set(false);
                return;
            }

            const escolhido = await this.pedidosService.escolherPagamento(this.id, this.token, forma.formaDePagamentoId);

            // Escolheu a forma: leva direto ao gateway (mesma aba; abrir outra aba depois de uma chamada assíncrona é bloqueado
            // pelo navegador). Sem link de redirecionamento (ex: Pix copia-e-cola), relê o pedido e mostra o QR Code/código.
            const url = escolhido?.cobranca?.urlDePagamento;
            if (url) {
                window.location.assign(url);
                return;
            }

            this.pedido.set(await this.pedidosService.buscarPublico(this.id, this.token));
            this.mostrandoOutrasFormas.set(false);
            await this.carregarOpcoesPagamento();
        } catch (error) {
            console.error('Erro ao escolher a forma de pagamento', error);
            this.toastService.show('Não foi possível gerar o pagamento. Tente novamente.', 'error');
        } finally {
            this.escolhendoForma.set(false);
        }
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
