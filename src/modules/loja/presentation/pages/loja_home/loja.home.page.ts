import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { LojaDataSource } from "../../../data/loja.data.source";
import { EcommerceReferenciaDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { PromocaoDto } from "../../../data/dtos/promocao.dto";
import { PromocaoPrecoService } from "../../../services/promocao-preco.service";
import { ProdutoCardComponent } from "../../components/produto_card/produto.card.component";
import { CarrinhoFacadeService } from "../../../../carrinho/services/carrinho.facade.service";
import { firstValueFrom } from "rxjs";
import { ToastService } from "../../components/ui/toast/toast.service";
import { HeaderComponent } from "../../components/header/header.component";
import { HeroComponent } from "../../components/hero/hero.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { ButtonComponent } from "../../components/ui/button/button.component";
import { InputComponent } from "../../components/ui/input/input.component";
import { TracoComponent } from "../../../../core/common_components/traco/traco.component";
import { CategoriaDataSource } from "../../../data/categoria.data.source";
import { CategoriaDto } from "../../../data/dtos/categoria.dto";

const LIMITE_POR_PAGINA = 24;
const DEBOUNCE_BUSCA_MS = 400;

@Component({
    selector: 'loja-home-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterLink, ProdutoCardComponent, TracoComponent,
        HeaderComponent, HeroComponent, FooterComponent, ButtonComponent, InputComponent,
    ],
    templateUrl: './loja.home.page.html',
    styleUrl: './loja.home.page.css',
})
export class LojaHomePage implements OnInit {
    categorias = signal<CategoriaDto[]>([]);
    skeletonItems = Array.from({ length: 8 });

    lojaFechada = signal(false);
    loading = signal(true);
    carregandoMais = signal(false);
    erro = signal('');
    referencias = signal<EcommerceReferenciaDto[]>([]);
    temMaisPaginas = signal(false);
    itensNoCarrinho = signal(0);
    busca = signal('');
    private paginaAtual = 1;
    private buscaDebounce?: ReturnType<typeof setTimeout>;
    private mapaPromocoesPorReferencia = new Map<number, PromocaoDto>();
    private promocoesGerais: PromocaoDto[] = [];
    private nomesFormaPagamento = new Map<number, string>();

    constructor(
        private lojaDataSource: LojaDataSource,
        private categoriaDataSource: CategoriaDataSource,
        private carrinhoFacadeService: CarrinhoFacadeService,
        private promocaoPrecoService: PromocaoPrecoService,
        private router: Router,
        private toastService: ToastService,
    ) { }

    async ngOnInit(): Promise<void> {
        await this.carregarCategorias();
        await this.atualizarContagemCarrinho();

        // Falha ao consultar o status não pode travar a loja -- segue como se estivesse aberta.
        const status = await firstValueFrom(this.lojaDataSource.status()).catch(() => ({ aberto: true }));
        if (!status.aberto) {
            this.lojaFechada.set(true);
            this.loading.set(false);
            return;
        }

        await this.carregarPromocoes();
        await this.carregarPagina(1);
    }

    private async carregarCategorias(): Promise<void> {
        try {
            this.categorias.set(await firstValueFrom(this.categoriaDataSource.listar()));
        } catch (error) {
            console.error('Erro ao carregar categorias', error);
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

    private aplicarPrecosPromocionais(referencias: EcommerceReferenciaDto[]): EcommerceReferenciaDto[] {
        return referencias.map((referencia) => ({
            ...referencia,
            valorPromocional: this.promocaoPrecoService.calcularParaReferencia(
                referencia.referenciaId,
                referencia.valor,
                this.mapaPromocoesPorReferencia,
                this.promocoesGerais,
            ) ?? undefined,
            melhorDesconto: this.promocaoPrecoService.melhorOpcaoParaReferencia(
                referencia.referenciaId,
                referencia.valor,
                this.mapaPromocoesPorReferencia,
                this.promocoesGerais,
                this.nomesFormaPagamento,
            ) ?? undefined,
        }));
    }

    private async carregarPagina(pagina: number): Promise<void> {
        try {
            const resposta = await firstValueFrom(
                this.lojaDataSource.listarReferencias(pagina, LIMITE_POR_PAGINA, this.busca().trim() || undefined),
            );
            this.paginaAtual = pagina;
            const itens = this.aplicarPrecosPromocionais(resposta.items);
            this.referencias.update((atual) => (pagina === 1 ? itens : [...atual, ...itens]));
            this.temMaisPaginas.set(resposta.meta?.has_next_page ?? false);
        } catch (error) {
            console.error('Erro ao carregar catálogo da loja', error);
            this.erro.set('Não foi possível carregar os produtos no momento.');
        } finally {
            this.loading.set(false);
            this.carregandoMais.set(false);
        }
    }

    async carregarMais(): Promise<void> {
        this.carregandoMais.set(true);
        await this.carregarPagina(this.paginaAtual + 1);
    }

    onBuscaChange(valor: string): void {
        this.busca.set(valor);
        clearTimeout(this.buscaDebounce);
        this.buscaDebounce = setTimeout(() => {
            this.loading.set(true);
            this.carregarPagina(1);
        }, DEBOUNCE_BUSCA_MS);
    }

    async atualizarContagemCarrinho(): Promise<void> {
        this.itensNoCarrinho.set(await this.carrinhoFacadeService.contarItens());
    }

    abrirReferencia(referencia: EcommerceReferenciaDto): void {
        this.router.navigate(['/loja/referencia', referencia.id]);
    }

    async adicionarAoCarrinho(referencia: EcommerceReferenciaDto): Promise<void> {
        // ponytail: referência com mais de um SKU (cor/tamanho) exige escolha na página de detalhe --
        // aqui só adiciona direto quando há exatamente um produto disponível.
        const idsDisponiveis = this.produtoIdUnicoDisponivel(referencia);
        if (idsDisponiveis == null) {
            this.router.navigate(['/loja/referencia', referencia.id]);
            return;
        }

        await this.carrinhoFacadeService.adicionar(idsDisponiveis, 1);
        await this.atualizarContagemCarrinho();
        this.toastService.show('Produto adicionado à sacola', 'success');
    }

    private produtoIdUnicoDisponivel(referencia: EcommerceReferenciaDto): number | null {
        if (!referencia.saldo || referencia.saldo <= 0) {
            return null;
        }
        const ids = (referencia.produtosDisponiveisIds ?? '').split(',').map((id) => id.trim()).filter(Boolean);
        return ids.length === 1 ? Number(ids[0]) : null;
    }
}
