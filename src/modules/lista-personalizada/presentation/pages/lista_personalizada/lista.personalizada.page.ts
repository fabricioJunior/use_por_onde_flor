import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { Meta } from "@angular/platform-browser";
import { firstValueFrom } from "rxjs";
import { ListaPersonalizadaDataSource } from "../../../data/lista.personalizada.data.source";
import { LojaDataSource } from "../../../../loja/data/loja.data.source";
import { EcommerceReferenciaDto } from "../../../../loja/data/dtos/ecommerce-referencia.dto";
import { ProdutoCardComponent } from "../../../../loja/presentation/components/produto_card/produto.card.component";
import { HeaderComponent } from "../../../../loja/presentation/components/header/header.component";
import { FooterComponent } from "../../../../loja/presentation/components/footer/footer.component";
import { CarrinhoFacadeService } from "../../../../carrinho/services/carrinho.facade.service";
import { ToastService } from "../../../../loja/presentation/components/ui/toast/toast.service";

@Component({
    selector: 'lista-personalizada-page',
    standalone: true,
    imports: [CommonModule, ProdutoCardComponent, HeaderComponent, FooterComponent],
    templateUrl: './lista.personalizada.page.html',
    styleUrl: './lista.personalizada.page.css',
})
export class ListaPersonalizadaPage implements OnInit {
    loading = signal(true);
    naoEncontrada = signal(false);
    referencias = signal<EcommerceReferenciaDto[]>([]);
    itensNoCarrinho = signal(0);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private listaDataSource: ListaPersonalizadaDataSource,
        private lojaDataSource: LojaDataSource,
        private carrinhoFacadeService: CarrinhoFacadeService,
        private toastService: ToastService,
        private meta: Meta,
    ) { }

    async ngOnInit(): Promise<void> {
        // Link privado compartilhado por link, não catálogo público -- não indexar.
        this.meta.addTag({ name: 'robots', content: 'noindex, nofollow' });

        const hash = this.route.snapshot.paramMap.get('hash') ?? '';
        this.itensNoCarrinho.set(await this.carrinhoFacadeService.contarItens());

        try {
            const lista = await firstValueFrom(this.listaDataSource.buscarPublico(hash));
            await this.carregarProdutos(lista.itens.map((item) => item.referenciaId).filter((id): id is number => !!id));
        } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 404) {
                this.naoEncontrada.set(true);
            } else {
                console.error('Erro ao carregar lista personalizada', error);
                this.naoEncontrada.set(true);
            }
        } finally {
            this.loading.set(false);
        }
    }

    // Resolve as referências do catálogo público a partir do referenciaId (a lista só devolve o id
    // "cru" da referência, não o id da view de e-commerce usado pra navegar/exibir -- ver
    // EcommerceReferenciaView.id vs referenciaId em apollo-api). Itens sem referência publicada no
    // catálogo (despublicada/sem estoque) somem da tela, silenciosamente.
    private async carregarProdutos(referenciaIds: number[]): Promise<void> {
        if (!referenciaIds.length) {
            return;
        }
        const resposta = await firstValueFrom(
            this.lojaDataSource.listarReferencias(1, referenciaIds.length, undefined, undefined, referenciaIds),
        );
        const porReferenciaId = new Map(resposta.items.map((item) => [item.referenciaId, item]));
        this.referencias.set(referenciaIds.map((id) => porReferenciaId.get(id)).filter((item): item is EcommerceReferenciaDto => !!item));
    }

    abrirReferencia(referencia: EcommerceReferenciaDto): void {
        this.router.navigate(['/loja/referencia', referencia.id]);
    }

    async adicionarAoCarrinho(referencia: EcommerceReferenciaDto): Promise<void> {
        const ids = (referencia.produtosDisponiveisIds ?? '').split(',').map((id) => id.trim()).filter(Boolean);
        if (!referencia.saldo || referencia.saldo <= 0 || ids.length !== 1) {
            this.abrirReferencia(referencia);
            return;
        }
        await this.carrinhoFacadeService.adicionar(Number(ids[0]), 1);
        this.itensNoCarrinho.set(await this.carrinhoFacadeService.contarItens());
        this.toastService.show('Produto adicionado à sacola', 'success');
    }
}
