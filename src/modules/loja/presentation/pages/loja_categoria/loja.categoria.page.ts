import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { LojaDataSource } from "../../../data/loja.data.source";
import { EcommerceReferenciaDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { PromocaoDto } from "../../../data/dtos/promocao.dto";
import { PromocaoPrecoService } from "../../../services/promocao-preco.service";
import { ProdutoCardComponent } from "../../components/produto_card/produto.card.component";
import { CarrinhoFacadeService } from "../../../../carrinho/services/carrinho.facade.service";
import { ToastService } from "../../components/ui/toast/toast.service";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { TracoComponent } from "../../../../core/common_components/traco/traco.component";
import { CATEGORIAS_MOCK, CategoriaMock } from "../../utils/categorias.mock";

const LIMITE_POR_PAGINA = 24;

@Component({
    selector: 'loja-categoria-page',
    standalone: true,
    imports: [
        CommonModule, RouterLink, ProdutoCardComponent, TracoComponent,
        HeaderComponent, FooterComponent,
    ],
    templateUrl: './loja.categoria.page.html',
    styleUrl: './loja.categoria.page.css',
})
export class LojaCategoriaPage implements OnInit {
    categorias = CATEGORIAS_MOCK;
    categoria = signal<CategoriaMock | undefined>(undefined);
    loading = signal(true);
    referencias = signal<EcommerceReferenciaDto[]>([]);
    itensNoCarrinho = signal(0);

    private mapaPromocoesPorReferencia = new Map<number, PromocaoDto>();
    private promocoesGerais: PromocaoDto[] = [];
    private nomesFormaPagamento = new Map<number, string>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private lojaDataSource: LojaDataSource,
        private carrinhoFacadeService: CarrinhoFacadeService,
        private promocaoPrecoService: PromocaoPrecoService,
        private toastService: ToastService,
    ) { }

    async ngOnInit(): Promise<void> {
        this.route.paramMap.subscribe((params) => {
            const slug = params.get('slug') ?? '';
            this.categoria.set(this.categorias.find((c) => c.slug === slug));
        });
        await Promise.all([this.carregarPromocoes(), this.atualizarContagemCarrinho()]);
        await this.carregarProdutos();
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
            console.error('Erro ao carregar promoções ativas', error);
        }
    }

    private async carregarProdutos(): Promise<void> {
        try {
            // Sem categoria->produto no backend ainda (ver categorias.mock.ts) -- mostra o catálogo
            // completo aqui até existir o endpoint real de filtro por categoria.
            const resposta = await firstValueFrom(
                this.lojaDataSource.listarReferencias(1, LIMITE_POR_PAGINA),
            );
            this.referencias.set(resposta.items.map((referencia) => ({
                ...referencia,
                valorPromocional: this.promocaoPrecoService.calcularParaReferencia(
                    referencia.referenciaId, referencia.valor, this.mapaPromocoesPorReferencia, this.promocoesGerais,
                ) ?? undefined,
                melhorDesconto: this.promocaoPrecoService.melhorOpcaoParaReferencia(
                    referencia.referenciaId, referencia.valor, this.mapaPromocoesPorReferencia,
                    this.promocoesGerais, this.nomesFormaPagamento,
                ) ?? undefined,
            })));
        } catch (error) {
            console.error('Erro ao carregar catálogo por categoria', error);
        } finally {
            this.loading.set(false);
        }
    }

    async atualizarContagemCarrinho(): Promise<void> {
        this.itensNoCarrinho.set(await this.carrinhoFacadeService.contarItens());
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
        await this.atualizarContagemCarrinho();
        this.toastService.show('Produto adicionado à sacola', 'success');
    }
}
