import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { LojaDataSource } from "../../../data/loja.data.source";
import { EcommerceReferenciaDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { ListaDetalheDto } from "../../../data/dtos/vitrine.dto";
import { PromocaoPrecoService } from "../../../services/promocao-preco.service";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { ProdutoCardComponent } from "../../components/produto_card/produto.card.component";

const LIMITE = 24;

// "Ver tudo" de uma vitrine / destino dos itens do menu (`GET /catalogos/listas/:id` +
// `/referencias`). Lista inativa/inexistente dá 404 no backend -- a página mostra estado vazio.
@Component({
    selector: 'loja-lista-page',
    standalone: true,
    imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, ProdutoCardComponent],
    templateUrl: './loja.lista.page.html',
    styleUrls: ['../../loja.shared.css', './loja.lista.page.css'],
})
export class LojaListaPage implements OnInit {
    carregando = signal(true);
    carregandoMais = signal(false);
    erro = signal('');
    lista = signal<ListaDetalheDto | null>(null);
    referencias = signal<EcommerceReferenciaDto[]>([]);
    temMais = signal(false);

    private listaId = '';
    private pagina = 1;

    constructor(
        private route: ActivatedRoute,
        private lojaDataSource: LojaDataSource,
        private promocaoPrecoService: PromocaoPrecoService,
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(async (params) => {
            this.listaId = params.get('id') ?? '';
            this.pagina = 1;
            this.referencias.set([]);
            await this.carregar();
        });
    }

    private async carregar(): Promise<void> {
        this.carregando.set(true);
        this.erro.set('');
        try {
            const [lista, resposta, promocoes] = await Promise.all([
                firstValueFrom(this.lojaDataSource.listaDetalhe(this.listaId)),
                firstValueFrom(this.lojaDataSource.listaReferencias(this.listaId, 1, LIMITE)),
                firstValueFrom(this.lojaDataSource.promocoesAtivas()).catch(() => ({ items: [] })),
            ]);
            this.lista.set(lista);
            this.referencias.set(this.comPreco(resposta.items, promocoes.items));
            this.temMais.set(resposta.meta?.has_next_page ?? false);
        } catch (error) {
            console.error('Erro ao carregar a lista do catálogo', error);
            this.erro.set('Não foi possível carregar esta seleção no momento.');
        } finally {
            this.carregando.set(false);
        }
    }

    private comPreco(referencias: EcommerceReferenciaDto[], promocoes: Parameters<PromocaoPrecoService['montarMapa']>[0]): EcommerceReferenciaDto[] {
        const mapa = this.promocaoPrecoService.montarMapa(promocoes);
        const gerais = this.promocaoPrecoService.promocoesGerais(promocoes);
        return referencias.map((r) => ({
            ...r,
            valorPromocional: this.promocaoPrecoService.calcularParaReferencia(r.referenciaId, r.valor, mapa, gerais) ?? undefined,
        }));
    }

    async carregarMais(): Promise<void> {
        this.carregandoMais.set(true);
        try {
            const [resposta, promocoes] = await Promise.all([
                firstValueFrom(this.lojaDataSource.listaReferencias(this.listaId, this.pagina + 1, LIMITE)),
                firstValueFrom(this.lojaDataSource.promocoesAtivas()).catch(() => ({ items: [] })),
            ]);
            this.pagina += 1;
            this.referencias.update((atual) => [...atual, ...this.comPreco(resposta.items, promocoes.items)]);
            this.temMais.set(resposta.meta?.has_next_page ?? false);
        } catch (error) {
            console.error('Erro ao carregar mais referências da lista', error);
        } finally {
            this.carregandoMais.set(false);
        }
    }
}
