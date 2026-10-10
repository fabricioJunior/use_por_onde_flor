import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { LojaDataSource } from "../../../data/loja.data.source";
import { ReferenciaMidiaPublicaDataSource } from "../../../data/referencia.midia.publica.data.source";
import { EcommerceReferenciaDto, EcommerceReferenciaProdutoDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { ReferenciaMidiaDto } from "../../../../referencias/data/referencia.data.source";
import { CheckoutDataSource } from "../../../../checkout/data/checkout.data.source";
import { OpcaoFreteDto } from "../../../../checkout/data/dtos/frete.dto";
import { MetaPixelService } from "../../../../core/meta-pixel/meta-pixel.service";
import { LOJA_CONFIG } from "../../../config/loja.config";
import { PromocaoPrecoService } from "../../../services/promocao-preco.service";
import { PromocaoDto } from "../../../data/dtos/promocao.dto";
import { SacolaService } from "../../../services/sacola.service";
import { formatarPreco, parcelas, precoPix, textoParcelamento } from "../../../services/preco.apresentacao.util";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { VitrineComponent } from "../../components/vitrine/vitrine.component";
import { normalizarNomeCor } from "../../utils/cor-apresentacao.util";

// Página de produto (README 2.1 a 2.7). Dados reais: referência, SKUs (cor/tamanho/estampa),
// mídias públicas, promoção ativa e cotação de frete por CEP. Blocos sem fonte no backend
// (parcelamento, Pix, "Compre junto") ficam ocultos por flag -- ver loja.config.ts.
@Component({
    selector: 'loja-referencia-page',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent, VitrineComponent],
    templateUrl: './loja.referencia.page.html',
    styleUrl: './loja.referencia.page.css',
})
export class LojaReferenciaPage implements OnInit {
    @ViewChild('galeria') galeriaRef?: ElementRef<HTMLElement>;

    config = LOJA_CONFIG;
    formatarPreco = formatarPreco;
    normalizarNomeCor = normalizarNomeCor;

    carregando = signal(true);
    erro = signal('');
    referencia = signal<EcommerceReferenciaDto | null>(null);
    produtos = signal<EcommerceReferenciaProdutoDto[]>([]);
    midias = signal<ReferenciaMidiaDto[]>([]);
    relacionados = signal<EcommerceReferenciaDto[]>([]);
    promocaoAplicada = signal<PromocaoDto | null>(null);
    valorPromocional = signal<number | undefined>(undefined);

    fotoAtual = signal(0);
    corSelecionada = signal<string | null>(null);
    tamanhoSelecionado = signal<string | null>(null);
    estampaSelecionada = signal<string | null>(null);
    quantidade = signal(1);
    aviso = signal<string | null>(null);
    adicionando = signal(false);

    acordeaoAberto = signal<string | null>('descricao');
    pagamentoAberto = signal(false);

    cep = signal('');
    cepErro = signal(false);
    cotando = signal(false);
    opcoesFrete = signal<OpcaoFreteDto[]>([]);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private lojaDataSource: LojaDataSource,
        private midiaDataSource: ReferenciaMidiaPublicaDataSource,
        private checkoutDataSource: CheckoutDataSource,
        private promocaoPrecoService: PromocaoPrecoService,
        private sacola: SacolaService,
        private metaPixel: MetaPixelService,
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(async (params) => {
            await this.carregar(params.get('id') ?? '');
        });
    }

    private async carregar(id: string): Promise<void> {
        this.carregando.set(true);
        this.erro.set('');
        this.resetarSelecao();

        if (!id) {
            this.erro.set('Produto não informado.');
            this.carregando.set(false);
            return;
        }

        try {
            const [referencia, produtos, promocoes] = await Promise.all([
                firstValueFrom(this.lojaDataSource.buscarReferencia(id)),
                firstValueFrom(this.lojaDataSource.listarProdutos(id)),
                firstValueFrom(this.lojaDataSource.promocoesAtivas()).catch(() => ({ items: [] as PromocaoDto[] })),
            ]);

            // Mídias usam o `referenciaId` real (não o id do vínculo com o e-commerce da rota).
            const midias = await firstValueFrom(this.midiaDataSource.listar(String(referencia.referenciaId)))
                .catch(() => [] as ReferenciaMidiaDto[]);

            this.referencia.set(referencia);
            this.produtos.set(produtos);
            this.midias.set(this.ordenarMidias(midias.filter((m) => m?.url)));

            const aplicada = this.promocaoPrecoService.promocaoAplicadaParaReferencia(
                referencia.referenciaId,
                referencia.valor,
                this.promocaoPrecoService.montarMapa(promocoes.items),
                this.promocaoPrecoService.promocoesGerais(promocoes.items),
            );
            this.promocaoAplicada.set(aplicada?.promocao ?? null);
            this.valorPromocional.set(aplicada?.valorFinal);

            this.metaPixel.viewContent({
                contentIds: [(referencia.idExterno ?? '').trim() || String(referencia.referenciaId)],
                contentType: 'product_group',
                value: this.preco(),
            });

            // Pré-seleciona quando só existe uma combinação vendável.
            const disponiveis = produtos.filter((p) => this.temEstoque(p));
            if (disponiveis.length === 1) {
                this.corSelecionada.set(disponiveis[0].corNome);
                this.tamanhoSelecionado.set(disponiveis[0].tamanhoNome);
                this.estampaSelecionada.set(disponiveis[0].estampaNome ?? null);
            } else if (new Set(disponiveis.map((p) => p.corNome)).size === 1) {
                this.corSelecionada.set(disponiveis[0]?.corNome ?? null);
            }

            void this.carregarRelacionados(referencia);
        } catch (error) {
            console.error('Erro ao carregar referência da loja', error);
            this.erro.set('Não foi possível carregar este produto no momento.');
        } finally {
            this.carregando.set(false);
        }
    }

    // "Você também pode gostar": não existe endpoint de relacionados -- usa o catálogo da mesma
    // categoria (dado real), tirando a própria referência. Sem categoria, a vitrine não aparece.
    private async carregarRelacionados(referencia: EcommerceReferenciaDto): Promise<void> {
        if (!referencia.categoriaId) {
            return;
        }
        try {
            const resposta = await firstValueFrom(
                this.lojaDataSource.listarReferencias(1, 12, undefined, [referencia.categoriaId]),
            );
            this.relacionados.set(resposta.items.filter((r) => r.id !== referencia.id));
        } catch (error) {
            console.error('Erro ao carregar produtos relacionados', error);
        }
    }

    private ordenarMidias(midias: ReferenciaMidiaDto[]): ReferenciaMidiaDto[] {
        return [...midias].sort((a, b) => Number(!!b.isDefault) - Number(!!a.isDefault));
    }

    private resetarSelecao(): void {
        this.fotoAtual.set(0);
        this.corSelecionada.set(null);
        this.tamanhoSelecionado.set(null);
        this.estampaSelecionada.set(null);
        this.quantidade.set(1);
        this.aviso.set(null);
        this.opcoesFrete.set([]);
        this.cepErro.set(false);
    }

    // "disponivel" é flag manual do admin; estoque é saldo real menos reservas. Vendável exige os dois.
    private temEstoque(produto: EcommerceReferenciaProdutoDto): boolean {
        return produto.disponivel && (produto.quantidadeDisponivel ?? produto.saldo ?? 0) > 0;
    }

    preco(): number {
        return this.valorPromocional() ?? this.referencia()?.valor ?? 0;
    }

    precoDe(): number | null {
        const referencia = this.referencia();
        return this.valorPromocional() != null && referencia ? referencia.valor : null;
    }

    parcelamento = computed(() => textoParcelamento(this.preco()));
    pix = computed(() => precoPix(this.preco()));
    tabelaParcelas = computed(() => parcelas(this.preco()));

    private static unicos(valores: (string | undefined)[]): string[] {
        const vistos: string[] = [];
        for (const valor of valores) {
            if (valor && !vistos.includes(valor)) {
                vistos.push(valor);
            }
        }
        return vistos;
    }

    cores = computed(() => LojaReferenciaPage.unicos(this.produtos().map((p) => p.corNome)));

    tamanhos = computed(() => {
        const cor = this.corSelecionada();
        return LojaReferenciaPage.unicos(
            this.produtos().filter((p) => !cor || p.corNome === cor).map((p) => p.tamanhoNome),
        );
    });

    // Estampa é a 3ª dimensão, opcional -- só aparece quando algum SKU tem estampa.
    estampas = computed(() => {
        const cor = this.corSelecionada();
        const tamanho = this.tamanhoSelecionado();
        return LojaReferenciaPage.unicos(
            this.produtos()
                .filter((p) => (!cor || p.corNome === cor) && (!tamanho || p.tamanhoNome === tamanho))
                .map((p) => p.estampaNome),
        );
    });

    // Imagem do swatch de estampa: mídia da referência que declara a mesma estampa. Sem mídia
    // correspondente, o swatch mostra o nome (nada inventado).
    imagemEstampa(estampa: string): string | null {
        return this.midias().find((m) => m.estampa === estampa)?.url ?? null;
    }

    corDisponivel(cor: string): boolean {
        return this.produtos().some((p) => p.corNome === cor && this.temEstoque(p));
    }

    tamanhoDisponivel(tamanho: string): boolean {
        const cor = this.corSelecionada();
        return this.produtos().some((p) => (!cor || p.corNome === cor) && p.tamanhoNome === tamanho && this.temEstoque(p));
    }

    estampaDisponivel(estampa: string): boolean {
        const cor = this.corSelecionada();
        const tamanho = this.tamanhoSelecionado();
        return this.produtos().some((p) =>
            (!cor || p.corNome === cor) && (!tamanho || p.tamanhoNome === tamanho) &&
            p.estampaNome === estampa && this.temEstoque(p),
        );
    }

    produtoSelecionado = computed(() => {
        const cor = this.corSelecionada();
        const tamanho = this.tamanhoSelecionado();
        const estampa = this.estampaSelecionada();
        return this.produtos().find((p) =>
            (!cor || p.corNome === cor) && (!tamanho || p.tamanhoNome === tamanho) &&
            (!estampa || p.estampaNome === estampa) && this.temEstoque(p),
        ) ?? null;
    });

    disponivelParaVenda = computed(() => this.produtos().some((p) => this.temEstoque(p)));

    // "Atenção, últimas peças!" -- limite real (saldo menos reservas) do SKU escolhido.
    ultimasPecas = computed(() => {
        const produto = this.produtoSelecionado();
        const limite = produto ? produto.quantidadeDisponivel ?? produto.saldo ?? 0 : 0;
        return produto != null && limite > 0 && limite <= 3;
    });

    acordeoes = computed(() => {
        const referencia = this.referencia();
        const composicao = [referencia?.composicao, referencia?.cuidados].filter((t) => !!t?.trim()).join('\n\n');
        return [
            { id: 'descricao', titulo: 'Descrição', texto: referencia?.descricao?.trim() ?? '' },
            { id: 'composicao', titulo: 'Composição e cuidados', texto: composicao },
        ].filter((s) => !!s.texto);
    });

    // --- Galeria ---

    selecionarFoto(indice: number): void {
        this.fotoAtual.set(indice);
        const el = this.galeriaRef?.nativeElement;
        el?.scrollTo({ left: indice * el.clientWidth, behavior: 'smooth' });
    }

    onGaleriaScroll(): void {
        const el = this.galeriaRef?.nativeElement;
        if (el && el.clientWidth > 0) {
            this.fotoAtual.set(Math.round(el.scrollLeft / el.clientWidth));
        }
    }

    // --- Seleção ---

    selecionarCor(cor: string): void {
        if (!this.corDisponivel(cor)) {
            return;
        }
        this.corSelecionada.set(cor);
        this.tamanhoSelecionado.set(null);
        this.estampaSelecionada.set(null);
        this.quantidade.set(1);
        this.aviso.set(null);
    }

    selecionarTamanho(tamanho: string): void {
        if (!this.tamanhoDisponivel(tamanho)) {
            return;
        }
        this.tamanhoSelecionado.set(tamanho);
        this.quantidade.set(1);
        this.aviso.set(null);
    }

    // Trocar a estampa troca a foto principal e volta a galeria pra foto 1 daquela estampa.
    selecionarEstampa(estampa: string): void {
        if (!this.estampaDisponivel(estampa)) {
            return;
        }
        this.estampaSelecionada.set(estampa);
        this.quantidade.set(1);
        this.aviso.set(null);
        const indice = this.midias().findIndex((m) => m.estampa === estampa);
        this.selecionarFoto(indice >= 0 ? indice : 0);
    }

    alterarQuantidade(delta: number): void {
        const produto = this.produtoSelecionado();
        const max = produto?.quantidadeDisponivel ?? produto?.saldo ?? 1;
        this.quantidade.update((atual) => Math.min(Math.max(1, atual + delta), Math.max(1, max)));
    }

    async comprar(): Promise<void> {
        if (!this.disponivelParaVenda()) {
            return;
        }
        if (this.cores().length > 1 && !this.corSelecionada()) {
            this.aviso.set('Escolha uma cor para continuar');
            return;
        }
        if (this.tamanhos().length > 1 && !this.tamanhoSelecionado()) {
            this.aviso.set('Escolha um tamanho para continuar');
            return;
        }
        if (this.estampas().length > 1 && !this.estampaSelecionada()) {
            this.aviso.set('Escolha uma estampa para continuar');
            return;
        }
        const produto = this.produtoSelecionado();
        if (!produto) {
            this.aviso.set('Essa combinação está indisponível no momento.');
            return;
        }

        this.adicionando.set(true);
        try {
            await this.sacola.adicionar(produto.produtoId, this.quantidade());
            void this.metaPixel.addToCart([
                {
                    produtoId: produto.produtoId,
                    idExterno: produto.idExterno,
                    quantidade: this.quantidade(),
                    valor: this.preco(),
                },
            ]);
        } finally {
            this.adicionando.set(false);
        }
    }

    // --- Frete (cotação real: POST /e-commerce/:id/checkout/frete) ---

    onCepChange(valor: string): void {
        const digitos = valor.replace(/\D/g, '').slice(0, 8);
        this.cep.set(digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos);
        this.cepErro.set(false);
    }

    async calcularFrete(): Promise<void> {
        const digitos = this.cep().replace(/\D/g, '');
        const produto = this.produtoSelecionado() ?? this.produtos().find((p) => this.temEstoque(p));
        if (digitos.length !== 8 || !produto) {
            this.cepErro.set(digitos.length !== 8);
            return;
        }
        this.cotando.set(true);
        this.opcoesFrete.set([]);
        try {
            const opcoes = await firstValueFrom(this.checkoutDataSource.cotarFrete({
                itens: [{ produtoId: produto.produtoId, quantidade: this.quantidade() }],
                cepDestino: digitos,
            }));
            this.opcoesFrete.set(opcoes ?? []);
        } catch (error) {
            console.error('Erro ao cotar frete', error);
            this.cepErro.set(true);
        } finally {
            this.cotando.set(false);
        }
    }

    valorFrete(opcao: OpcaoFreteDto): number {
        return opcao.customPrice ?? opcao.price;
    }

    prazoFrete(opcao: OpcaoFreteDto): string {
        const dias = opcao.customDeliveryTime ?? opcao.deliveryTime;
        return dias === 1 ? '1 dia útil' : `${dias} dias úteis`;
    }

    // --- Diversos ---

    alternarAcordeao(id: string): void {
        this.acordeaoAberto.update((atual) => (atual === id ? null : id));
    }

    compartilharWhatsapp(): string {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        return `https://wa.me/?text=${encodeURIComponent(`${this.referencia()?.nome ?? ''} ${url}`)}`;
    }

    compartilharPinterest(): string {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const midia = this.midias()[0]?.url ?? '';
        return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(midia)}`;
    }

    async copiarLink(): Promise<void> {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(window.location.href);
        }
    }

    verCategoria(): void {
        const categoriaId = this.referencia()?.categoriaId;
        if (categoriaId) {
            this.router.navigate(['/loja/categoria', categoriaId]);
        }
    }
}
