import { CommonModule } from "@angular/common";
import { Component, DestroyRef, ElementRef, OnInit, inject, signal, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { LojaDataSource } from "../../../data/loja.data.source";
import { CategoriaDataSource } from "../../../data/categoria.data.source";
import { CategoriaDto } from "../../../data/dtos/categoria.dto";
import { EcommerceReferenciaDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { PromocaoDto } from "../../../data/dtos/promocao.dto";
import { PromocaoPrecoService } from "../../../services/promocao-preco.service";
import { ProdutoCardComponent } from "../../components/produto_card/produto.card.component";
import { CarrinhoFacadeService } from "../../../../carrinho/services/carrinho.facade.service";
import { ToastService } from "../../components/ui/toast/toast.service";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { TracoComponent } from "../../../../core/common_components/traco/traco.component";

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
    @ViewChild('chipsRail') chipsRail?: ElementRef<HTMLElement>;

    categoria = signal<CategoriaDto | undefined>(undefined);
    categorias = signal<CategoriaDto[]>([]);
    lojaFechada = signal(false);
    loading = signal(true);
    referencias = signal<EcommerceReferenciaDto[]>([]);
    itensNoCarrinho = signal(0);

    private categoriaId = 0;
    private mapaPromocoesPorReferencia = new Map<number, PromocaoDto>();
    private promocoesGerais: PromocaoDto[] = [];
    private nomesFormaPagamento = new Map<number, string>();
    private destroyRef = inject(DestroyRef);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private lojaDataSource: LojaDataSource,
        private categoriaDataSource: CategoriaDataSource,
        private carrinhoFacadeService: CarrinhoFacadeService,
        private promocaoPrecoService: PromocaoPrecoService,
        private toastService: ToastService,
    ) { }

    ngOnInit(): void {
        this.categorias.set([]);
        this.carregarCategorias();

        // Clicar num chip da própria tela navega pra `/loja/categoria/:id` com
        // outro id -- o Angular reaproveita esta mesma instância (só o param
        // muda), então `ngOnInit` não roda de novo. Sem isso, o :id ficava
        // travado no primeiro valor e os chips pareciam não fazer nada.
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            this.categoriaId = Number(params.get('id'));
            this.carregarDadosDaCategoria();
        });
    }

    private async carregarDadosDaCategoria(): Promise<void> {
        this.loading.set(true);
        this.lojaFechada.set(false);
        this.referencias.set([]);

        await this.carregarCategoria();
        await this.atualizarContagemCarrinho();

        // Falha ao consultar o status não pode travar a loja -- segue como se estivesse aberta.
        const status = await firstValueFrom(this.lojaDataSource.status()).catch(() => ({ aberto: true }));
        if (!status.aberto) {
            this.lojaFechada.set(true);
            this.loading.set(false);
            return;
        }

        await this.carregarPromocoes();
        await this.carregarProdutos();
    }

    private async carregarCategoria(): Promise<void> {
        try {
            this.categoria.set(await firstValueFrom(this.categoriaDataSource.buscar(this.categoriaId)));
        } catch (error) {
            console.error('Erro ao carregar categoria', error);
        }
    }

    private async carregarCategorias(): Promise<void> {
        try {
            this.categorias.set(await firstValueFrom(this.lojaDataSource.listarCategorias()));
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
            console.error('Erro ao carregar promoções ativas', error);
        }
    }

    private async carregarProdutos(): Promise<void> {
        try {
            const resposta = await firstValueFrom(
                this.lojaDataSource.listarReferencias(1, LIMITE_POR_PAGINA, undefined, [this.categoriaId]),
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

    rolarChips(direcao: 1 | -1): void {
        this.chipsRail?.nativeElement.scrollBy({ left: direcao * 180, behavior: 'smooth' });
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
