import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild, signal } from "@angular/core";
import { Router } from "@angular/router";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { LojaDataSource } from "../../../data/loja.data.source";
import { EcommerceReferenciaDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { ProdutoCardComponent } from "../../components/produto_card/produto.card.component";
import { CarrinhoFacadeService } from "../../../../carrinho/services/carrinho.facade.service";
import { firstValueFrom } from "rxjs";
import { ToastService } from "../../components/ui/toast/toast.service";
import { HeaderComponent } from "../../components/header/header.component";
import { HeroComponent } from "../../components/hero/hero.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { ButtonComponent } from "../../components/ui/button/button.component";

const LIMITE_POR_PAGINA = 24;

@Component({
    selector: 'loja-home-page',
    standalone: true,
    imports: [
        CommonModule, MatProgressSpinnerModule, ProdutoCardComponent,
        HeaderComponent, HeroComponent, FooterComponent, ButtonComponent,
    ],
    templateUrl: './loja.home.page.html',
    styleUrl: './loja.home.page.css',
})
export class LojaHomePage implements OnInit {
    @ViewChild('produtos') produtosRef?: ElementRef<HTMLElement>;

    loading = signal(true);
    carregandoMais = signal(false);
    erro = signal('');
    referencias = signal<EcommerceReferenciaDto[]>([]);
    temMaisPaginas = signal(false);
    itensNoCarrinho = signal(0);
    private paginaAtual = 1;

    constructor(
        private lojaDataSource: LojaDataSource,
        private carrinhoFacadeService: CarrinhoFacadeService,
        private router: Router,
        private toastService: ToastService,
    ) { }

    async ngOnInit(): Promise<void> {
        await Promise.all([this.carregarPagina(1), this.atualizarContagemCarrinho()]);
    }

    private async carregarPagina(pagina: number): Promise<void> {
        try {
            const resposta = await firstValueFrom(this.lojaDataSource.listarReferencias(pagina, LIMITE_POR_PAGINA));
            this.paginaAtual = pagina;
            this.referencias.update((atual) => (pagina === 1 ? resposta.items : [...atual, ...resposta.items]));
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

    async atualizarContagemCarrinho(): Promise<void> {
        this.itensNoCarrinho.set(await this.carrinhoFacadeService.contarItens());
    }

    scrollParaProdutos(): void {
        if (typeof window === 'undefined') {
            return;
        }
        this.produtosRef?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }

    abrirReferencia(referencia: EcommerceReferenciaDto): void {
        this.router.navigate(['/loja/referencia', referencia.id]);
    }

    async adicionarAoCarrinho(referencia: EcommerceReferenciaDto): Promise<void> {
        // ponytail: referência com mais de um SKU (cor/tamanho) exige escolha na página de detalhe --
        // aqui só adiciona direto quando há exatamente um produto disponível.
        const idsDisponiveis = (referencia.produtosDisponiveisIds ?? '').split(',').map((id) => id.trim()).filter(Boolean);
        if (idsDisponiveis.length !== 1) {
            this.router.navigate(['/loja/referencia', referencia.id]);
            return;
        }

        await this.carrinhoFacadeService.adicionar(Number(idsDisponiveis[0]), 1);
        await this.atualizarContagemCarrinho();
        this.toastService.show('Produto adicionado à sacola', 'success');
    }
}
