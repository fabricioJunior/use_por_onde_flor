import { CommonModule } from "@angular/common";
import { Component, DestroyRef, OnInit, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { LojaDataSource } from "../../../data/loja.data.source";
import { EcommerceReferenciaDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { ListaResumoDto } from "../../../data/dtos/lista-catalogo.dto";
import { PromocaoDto } from "../../../data/dtos/promocao.dto";
import { PromocaoPrecoService } from "../../../services/promocao-preco.service";
import { ProdutoCardComponent } from "../../components/produto_card/produto.card.component";
import { CarrinhoFacadeService } from "../../../../carrinho/services/carrinho.facade.service";
import { ToastService } from "../../components/ui/toast/toast.service";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { ButtonComponent } from "../../components/ui/button/button.component";
import { MetaPixelService } from "../../../../core/meta-pixel/meta-pixel.service";

const LIMITE_POR_PAGINA = 24;

// Página de uma lista do catálogo (/loja/lista/:id). A API não tem endpoint de detalhe da lista:
// título/descrição/ícone vêm do menu da vitrine (quando a lista está lá); sem isso, a página
// mostra só os produtos.
@Component({
    selector: 'loja-lista-page',
    standalone: true,
    imports: [CommonModule, RouterLink, ProdutoCardComponent, HeaderComponent, FooterComponent, ButtonComponent],
    templateUrl: './loja.lista.page.html',
    styleUrl: './loja.lista.page.css',
})
export class LojaListaPage implements OnInit {
    skeletonItems = Array.from({ length: 8 });

    lista = signal<ListaResumoDto | undefined>(undefined);
    lojaFechada = signal(false);
    naoEncontrada = signal(false);
    loading = signal(true);
    carregandoMais = signal(false);
    erro = signal('');
    referencias = signal<EcommerceReferenciaDto[]>([]);
    temMaisPaginas = signal(false);
    itensNoCarrinho = signal(0);

    private listaId = '';
    private paginaAtual = 1;
    private mapaPromocoesPorReferencia = new Map<number, PromocaoDto>();
    private promocoesGerais: PromocaoDto[] = [];
    private nomesFormaPagamento = new Map<number, string>();
    private destroyRef = inject(DestroyRef);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private lojaDataSource: LojaDataSource,
        private carrinhoFacadeService: CarrinhoFacadeService,
        private promocaoPrecoService: PromocaoPrecoService,
        private toastService: ToastService,
        private metaPixel: MetaPixelService,
    ) { }

    ngOnInit(): void {
        // Navegar entre listas pelo drawer reaproveita esta instância (só o param muda).
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            this.listaId = params.get('id') ?? '';
            void this.carregarTudo();
        });
    }

    private async carregarTudo(): Promise<void> {
        this.loading.set(true);
        this.lojaFechada.set(false);
        this.naoEncontrada.set(false);
        this.erro.set('');
        this.referencias.set([]);
        this.lista.set(undefined);

        this.itensNoCarrinho.set(await this.carrinhoFacadeService.contarItens());

        // Falha ao consultar o status não pode travar a loja -- segue como se estivesse aberta.
        const status = await firstValueFrom(this.lojaDataSource.status()).catch(() => ({ aberto: true }));
        if (!status.aberto) {
            this.lojaFechada.set(true);
            this.loading.set(false);
            return;
        }

        await Promise.all([this.carregarCabecalho(), this.carregarPromocoes()]);
        await this.carregarPagina(1);
    }

    private async carregarCabecalho(): Promise<void> {
        try {
            const itens = await firstValueFrom(this.lojaDataSource.vitrineMenu());
            const id = Number(this.listaId);
            for (const item of itens) {
                const achada = item.tipo === 'lista' ? (item.id === id ? item : undefined) : item.listas.find((l) => l.id === id);
                if (achada) {
                    this.lista.set(achada);
                    return;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar cabeçalho da lista', error);
        }
    }

    private async carregarPromocoes(): Promise<void> {
        try {
            const [resposta, formas] = await Promise.all([
                firstValueFrom(this.lojaDataSource.promocoesAtivas()),
                firstValueFrom(this.lojaDataSource.formaPagamento()),
            ]);
            this.mapaPromocoesPorReferencia = this.promocaoPrecoService.montarMapa(resposta.items);
            this.promocoesGerais = this.promocaoPrecoService.promocoesGerais(resposta.items);
            this.nomesFormaPagamento = new Map(formas.map((f) => [f.formaDePagamentoId, f.descricao]));
        } catch (error) {
            // Falha ao buscar promoção não pode derrubar o catálogo -- só segue sem desconto.
            console.error('Erro ao carregar promoções ativas', error);
        }
    }

    private async carregarPagina(pagina: number): Promise<void> {
        try {
            const resposta = await firstValueFrom(
                this.lojaDataSource.listarReferenciasDaLista(this.listaId, pagina, LIMITE_POR_PAGINA),
            );
            this.paginaAtual = pagina;
            const itens = resposta.items.map((referencia) => ({
                ...referencia,
                valorPromocional: this.promocaoPrecoService.calcularParaReferencia(
                    referencia.referenciaId, referencia.valor, this.mapaPromocoesPorReferencia, this.promocoesGerais,
                ) ?? undefined,
                melhorDesconto: this.promocaoPrecoService.melhorOpcaoParaReferencia(
                    referencia.referenciaId, referencia.valor, this.mapaPromocoesPorReferencia,
                    this.promocoesGerais, this.nomesFormaPagamento,
                ) ?? undefined,
            }));
            this.referencias.update((atual) => (pagina === 1 ? itens : [...atual, ...itens]));
            this.temMaisPaginas.set(resposta.meta?.has_next_page ?? false);
        } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 404) {
                this.naoEncontrada.set(true);
            } else {
                console.error('Erro ao carregar produtos da lista', error);
                this.erro.set('Não foi possível carregar os produtos no momento.');
            }
        } finally {
            this.loading.set(false);
            this.carregandoMais.set(false);
        }
    }

    async carregarMais(): Promise<void> {
        this.carregandoMais.set(true);
        await this.carregarPagina(this.paginaAtual + 1);
    }

    abrirReferencia(referencia: EcommerceReferenciaDto): void {
        this.router.navigate(['/loja/referencia', referencia.id]);
    }

    async adicionarAoCarrinho(referencia: EcommerceReferenciaDto): Promise<void> {
        const ids = (referencia.produtosDisponiveisIds ?? '').split(',').map((id) => id.trim()).filter(Boolean);
        if (!referencia.saldo || referencia.saldo <= 0 || ids.length !== 1) {
            this.router.navigate(['/loja/referencia', referencia.id]);
            return;
        }
        await this.carrinhoFacadeService.adicionar(Number(ids[0]), 1);
        void this.metaPixel.addToCart([{ produtoId: Number(ids[0]), quantidade: 1, valor: referencia.valor }]);
        this.itensNoCarrinho.set(await this.carrinhoFacadeService.contarItens());
        this.toastService.show('Produto adicionado à sacola', 'success');
    }
}
