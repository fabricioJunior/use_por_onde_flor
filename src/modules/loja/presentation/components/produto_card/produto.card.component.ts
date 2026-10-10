import { CommonModule } from "@angular/common";
import { Component, Input, computed, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { EcommerceReferenciaDto, EcommerceReferenciaProdutoDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { LojaDataSource } from "../../../data/loja.data.source";
import { SacolaService } from "../../../services/sacola.service";
import { formatarPreco, textoParcelamento } from "../../../services/preco.apresentacao.util";
import { MetaPixelService } from "../../../../core/meta-pixel/meta-pixel.service";

// Card de produto do handoff (README 1.6): foto 3:4 com grafismo, selo, nome, preço, parcelamento,
// chips de tamanho e botão Comprar.
//
// ponytail: os SKUs (tamanhos) NÃO vêm na resposta da vitrine -- `EcommerceReferenciaView` só traz
// os ids disponíveis, sem nome de tamanho. Buscar `/referencias/:id/produtos` pra todos os cards da
// home seria uma requisição por card. Então a grade é carregada na primeira intenção de compra
// (hover no desktop / toque no botão), e até lá o card mostra só o botão. Se o backend passar a
// devolver os tamanhos na vitrine, trocar `garantirProdutos()` por leitura direta do DTO.
@Component({
    selector: 'produto-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './produto.card.component.html',
    styleUrl: './produto.card.component.css',
})
export class ProdutoCardComponent {
    @Input({ required: true }) referencia!: EcommerceReferenciaDto;

    produtos = signal<EcommerceReferenciaProdutoDto[] | null>(null);
    tamanhoSelecionado = signal<string | null>(null);
    avisoTamanho = signal(false);
    ocupado = signal(false);

    formatarPreco = formatarPreco;

    constructor(
        private lojaDataSource: LojaDataSource,
        private sacola: SacolaService,
        private router: Router,
        private metaPixel: MetaPixelService,
    ) { }

    get preco(): number {
        return this.referencia.valorPromocional ?? this.referencia.valor;
    }

    get precoDe(): number | null {
        return this.referencia.valorPromocional != null ? this.referencia.valor : null;
    }

    parcelamento = computed(() => textoParcelamento(this.preco));

    // "-X%" quando há preço promocional; senão nenhum selo. ("Novo" não tem fonte no backend --
    // a view não expõe data de criação da referência, então o selo não é inventado.)
    get percentualOff(): number | null {
        const de = this.precoDe;
        return de && de > this.preco ? Math.round((1 - this.preco / de) * 100) : null;
    }

    semEstoque(): boolean {
        return !this.referencia.saldo || this.referencia.saldo <= 0;
    }

    tamanhos = computed(() => {
        const produtos = this.produtos();
        if (!produtos) {
            return [];
        }
        const nomes: string[] = [];
        for (const p of produtos) {
            if (this.disponivel(p) && p.tamanhoNome && !nomes.includes(p.tamanhoNome)) {
                nomes.push(p.tamanhoNome);
            }
        }
        return nomes;
    });

    private disponivel(produto: EcommerceReferenciaProdutoDto): boolean {
        return produto.disponivel && (produto.quantidadeDisponivel ?? produto.saldo ?? 0) > 0;
    }

    abrir(): void {
        this.router.navigate(['/loja/referencia', this.referencia.id]);
    }

    async garantirProdutos(): Promise<EcommerceReferenciaProdutoDto[]> {
        const atual = this.produtos();
        if (atual) {
            return atual;
        }
        try {
            const produtos = await firstValueFrom(this.lojaDataSource.listarProdutos(String(this.referencia.id)));
            this.produtos.set(produtos);
            return produtos;
        } catch (error) {
            console.error('Erro ao carregar a grade da referência', error);
            this.produtos.set([]);
            return [];
        }
    }

    escolherTamanho(tamanho: string, event: Event): void {
        event.stopPropagation();
        this.tamanhoSelecionado.set(tamanho);
        this.avisoTamanho.set(false);
    }

    // Um único SKU disponível -> adiciona direto. Vários tamanhos -> precisa escolher. Mais de uma
    // cor/estampa -> não dá pra resolver no card, manda pra página do produto.
    async comprar(event: Event): Promise<void> {
        event.stopPropagation();
        this.ocupado.set(true);
        try {
            const produtos = (await this.garantirProdutos()).filter((p) => this.disponivel(p));
            if (produtos.length === 0) {
                this.abrir();
                return;
            }
            const cores = new Set(produtos.map((p) => p.corNome).filter(Boolean));
            const estampas = new Set(produtos.map((p) => p.estampaNome).filter(Boolean));
            if (cores.size > 1 || estampas.size > 1) {
                this.abrir();
                return;
            }
            if (produtos.length === 1) {
                await this.adicionar(produtos[0]);
                return;
            }
            const tamanho = this.tamanhoSelecionado();
            const escolhido = tamanho ? produtos.find((p) => p.tamanhoNome === tamanho) : undefined;
            if (!escolhido) {
                this.avisoTamanho.set(true);
                return;
            }
            await this.adicionar(escolhido);
        } finally {
            this.ocupado.set(false);
        }
    }

    private async adicionar(produto: EcommerceReferenciaProdutoDto): Promise<void> {
        await this.sacola.adicionar(produto.produtoId, 1);
        void this.metaPixel.addToCart([
            { produtoId: produto.produtoId, idExterno: produto.idExterno, quantidade: 1, valor: this.preco },
        ]);
    }
}
