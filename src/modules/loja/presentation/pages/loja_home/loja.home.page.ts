import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { LojaDataSource } from "../../../data/loja.data.source";
import { EcommerceReferenciaDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { VitrineHomeItemDto } from "../../../data/dtos/vitrine.dto";
import { LOJA_CONFIG } from "../../../config/loja.config";
import { PromocaoPrecoService } from "../../../services/promocao-preco.service";
import { MenuVitrineService } from "../../../services/menu.vitrine.service";
import { HeaderComponent } from "../../components/header/header.component";
import { HeroComponent } from "../../components/hero/hero.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { VitrineComponent } from "../../components/vitrine/vitrine.component";
import { ProdutoCardComponent } from "../../components/produto_card/produto.card.component";

const LIMITE_BUSCA = 24;

// Home da loja (README 1.1 a 1.10). Nada de vitrine fixa: as seções vêm de
// `GET /catalogos/vitrine/home` na ordem definida no admin, e vitrine sem referência não aparece.
// Com `?q=` na URL (busca do header) a página mostra o resultado em grade em vez das vitrines.
@Component({
    selector: 'loja-home-page',
    standalone: true,
    imports: [CommonModule, HeaderComponent, HeroComponent, FooterComponent, VitrineComponent, ProdutoCardComponent],
    templateUrl: './loja.home.page.html',
    styleUrl: './loja.home.page.css',
})
export class LojaHomePage implements OnInit {
    config = LOJA_CONFIG;

    carregando = signal(true);
    lojaFechada = signal(false);
    erro = signal('');
    vitrines = signal<VitrineHomeItemDto[]>([]);

    busca = signal('');
    resultado = signal<EcommerceReferenciaDto[]>([]);

    constructor(
        private lojaDataSource: LojaDataSource,
        private promocaoPrecoService: PromocaoPrecoService,
        private route: ActivatedRoute,
        private menuService: MenuVitrineService,
    ) { }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(async (params) => {
            this.busca.set(params.get('q')?.trim() ?? '');
            await this.carregar();
        });
    }

    private async carregar(): Promise<void> {
        this.carregando.set(true);
        this.erro.set('');
        try {
            // Falha ao consultar o status não pode travar a loja -- segue como se estivesse aberta.
            const status = await firstValueFrom(this.lojaDataSource.status()).catch(() => ({ aberto: true }));
            this.lojaFechada.set(!status.aberto);
            if (!status.aberto) {
                return;
            }

            const promocoes = await firstValueFrom(this.lojaDataSource.promocoesAtivas()).catch(() => ({ items: [] }));
            const mapa = this.promocaoPrecoService.montarMapa(promocoes.items);
            const gerais = this.promocaoPrecoService.promocoesGerais(promocoes.items);
            const comPreco = (referencias: EcommerceReferenciaDto[]) => referencias.map((r) => ({
                ...r,
                valorPromocional: this.promocaoPrecoService.calcularParaReferencia(r.referenciaId, r.valor, mapa, gerais) ?? undefined,
            }));

            if (this.busca()) {
                const resposta = await firstValueFrom(
                    this.lojaDataSource.listarReferencias(1, LIMITE_BUSCA, this.busca()),
                );
                this.resultado.set(comPreco(resposta.items));
                this.vitrines.set([]);
                return;
            }

            const vitrines = await firstValueFrom(this.lojaDataSource.vitrineHome(this.config.vitrineLimite));
            this.vitrines.set(
                vitrines
                    .filter((v) => v.referencias?.length)
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((v) => ({ ...v, referencias: comPreco(v.referencias) })),
            );
            this.resultado.set([]);
        } catch (error) {
            console.error('Erro ao carregar a home da loja', error);
            this.erro.set('Não foi possível carregar a loja no momento.');
        } finally {
            this.carregando.set(false);
        }
    }

    destaque(nome: string | null): boolean {
        return this.menuService.ehDestaque(nome);
    }
}
