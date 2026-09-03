import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild, signal, computed } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { PofLoaderComponent } from "../../../../core/common_components/pof_loader/pof.loader.component";
import { LojaDataSource } from "../../../data/loja.data.source";
import { ReferenciaMidiaPublicaDataSource } from "../../../data/referencia.midia.publica.data.source";
import { EcommerceReferenciaDto, EcommerceReferenciaProdutoDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { ReferenciaMidiaDto } from "../../../../referencias/data/referencia.data.source";
import { CarrinhoFacadeService } from "../../../../carrinho/services/carrinho.facade.service";
import { ButtonComponent } from "../../components/ui/button/button.component";
import { ToastService } from "../../components/ui/toast/toast.service";
import { corEhClara, corParaHex, normalizarNomeCor } from "../../utils/cor-apresentacao.util";
import { HeaderComponent } from "../../components/header/header.component";
import { PromocaoPrecoService } from "../../../services/promocao-preco.service";

@Component({
    selector: 'loja-referencia-page',
    standalone: true,
    imports: [CommonModule, PofLoaderComponent, ButtonComponent, HeaderComponent],
    templateUrl: './loja.referencia.page.html',
    styleUrl: './loja.referencia.page.css',
})
export class LojaReferenciaPage implements OnInit {
    @ViewChild('secaoCor') secaoCorRef?: ElementRef<HTMLElement>;
    @ViewChild('secaoTamanho') secaoTamanhoRef?: ElementRef<HTMLElement>;
    @ViewChild('secaoEstampa') secaoEstampaRef?: ElementRef<HTMLElement>;
    @ViewChild('thumbLista') thumbListaRef?: ElementRef<HTMLElement>;
    @ViewChild('corLista') corListaRef?: ElementRef<HTMLElement>;
    @ViewChild('tamanhoLista') tamanhoListaRef?: ElementRef<HTMLElement>;
    @ViewChild('estampaLista') estampaListaRef?: ElementRef<HTMLElement>;

    loading = signal(true);
    erro = signal('');
    itensNoCarrinho = signal(0);
    referencia = signal<EcommerceReferenciaDto | null>(null);
    valorPromocional = signal<number | undefined>(undefined);
    produtos = signal<EcommerceReferenciaProdutoDto[]>([]);
    midias = signal<ReferenciaMidiaDto[]>([]);
    fotoSelecionada = signal<ReferenciaMidiaDto | null>(null);

    zoomAtivo = signal(false);
    panX = signal(0);
    panY = signal(0);
    podeRolarThumbEsquerda = signal(false);
    podeRolarThumbDireita = signal(false);
    podeRolarCorEsquerda = signal(false);
    podeRolarCorDireita = signal(false);
    podeRolarTamanhoEsquerda = signal(false);
    podeRolarTamanhoDireita = signal(false);
    podeRolarEstampaEsquerda = signal(false);
    podeRolarEstampaDireita = signal(false);

    // Estado de gesto (pointer down/move/up) -- não precisa ser signal, só usado durante o drag.
    private gestoAtivo = false;
    private gestoOrigemX = 0;
    private gestoOrigemY = 0;
    private gestoMoveu = false;
    private panOrigemX = 0;
    private panOrigemY = 0;

    private static readonly LIMIAR_TAP_PX = 8; // abaixo disso é clique/tap, não arrasto
    private static readonly LIMIAR_SWIPE_PX = 50; // acima disso troca de foto

    corSelecionada = signal<string | null>(null);
    tamanhoSelecionado = signal<string | null>(null);
    estampaSelecionada = signal<string | null>(null);
    adicionando = signal(false);
    adicionado = signal(false);
    quantidade = signal(1);
    mensagemValidacao = signal<string | null>(null);

    normalizarNomeCor = normalizarNomeCor;

    corSelecionadaLabel = computed(() => {
        const cor = this.corSelecionada();
        return cor ? normalizarNomeCor(cor) : 'Selecione uma cor';
    });

    tamanhoSelecionadoLabel = computed(() => this.tamanhoSelecionado() ?? 'Selecione um tamanho');
    estampaSelecionadaLabel = computed(() => this.estampaSelecionada() ?? 'Selecione uma estampa');

    // "disponivel" é flag manual do admin (vínculo produto<->e-commerce), independente do estoque
    // -- produto pode estar disponivel=true com quantidadeDisponivel=0 (sem saldo real, ou saldo
    // todo reservado por outro pedido em pagamento). Selecionável exige as duas coisas.
    private temEstoque(produto: EcommerceReferenciaProdutoDto): boolean {
        return produto.disponivel && (produto.quantidadeDisponivel ?? produto.saldo ?? 0) > 0;
    }

    produtosDisponiveis = computed(() => this.produtos().filter((produto) => this.temEstoque(produto)));

    // Preserva a ordem que a API já manda (saldo desc, alfabética) -- não usar Set+sort.
    private static primeiraOcorrencia(valores: string[]): string[] {
        const vistos = new Set<string>();
        const ordenado: string[] = [];
        for (const valor of valores) {
            if (valor && !vistos.has(valor)) {
                vistos.add(valor);
                ordenado.push(valor);
            }
        }
        return ordenado;
    }

    cores = computed(() => LojaReferenciaPage.primeiraOcorrencia(this.produtos().map((produto) => produto.corNome)));

    tamanhosParaCorAtual = computed(() => {
        const cor = this.corSelecionada();
        return LojaReferenciaPage.primeiraOcorrencia(
            this.produtos()
                .filter((produto) => !cor || produto.corNome === cor)
                .map((produto) => produto.tamanhoNome),
        );
    });

    // Estampa é a 3ª dimensão, opcional -- a maioria das referências não tem nenhum produto com
    // estampa, então a seção só aparece quando existir pelo menos um. Reaproveita o mesmo padrão de
    // cascata do tamanho (filtrado pela cor/tamanho já escolhidos).
    referenciaTemEstampa = computed(() => this.produtos().some((produto) => !!produto.estampaNome));

    estampasParaSelecaoAtual = computed(() => {
        const cor = this.corSelecionada();
        const tamanho = this.tamanhoSelecionado();
        return LojaReferenciaPage.primeiraOcorrencia(
            this.produtos()
                .filter((produto) =>
                    (!cor || produto.corNome === cor) &&
                    (!tamanho || produto.tamanhoNome === tamanho) &&
                    !!produto.estampaNome,
                )
                .map((produto) => produto.estampaNome!),
        );
    });

    corHex(cor: string): string | null {
        return corParaHex(normalizarNomeCor(cor));
    }

    corEhClara(cor: string): boolean {
        return corEhClara(this.corHex(cor));
    }

    corDisponivel(cor: string): boolean {
        return this.produtos().some((produto) => produto.corNome === cor && this.temEstoque(produto));
    }

    tamanhoDisponivel(tamanho: string): boolean {
        const cor = this.corSelecionada();
        return this.produtos().some((produto) =>
            (!cor || produto.corNome === cor) && produto.tamanhoNome === tamanho && this.temEstoque(produto),
        );
    }

    estampaDisponivel(estampa: string): boolean {
        const cor = this.corSelecionada();
        const tamanho = this.tamanhoSelecionado();
        return this.produtos().some((produto) =>
            (!cor || produto.corNome === cor) &&
            (!tamanho || produto.tamanhoNome === tamanho) &&
            produto.estampaNome === estampa && this.temEstoque(produto),
        );
    }

    produtoSelecionado = computed(() => {
        const cor = this.corSelecionada();
        const tamanho = this.tamanhoSelecionado();
        const estampa = this.estampaSelecionada();
        const candidatos = this.produtos().filter((produto) =>
            (!cor || produto.corNome === cor) &&
            (!tamanho || produto.tamanhoNome === tamanho) &&
            (!estampa || produto.estampaNome === estampa),
        );
        return candidatos.find((produto) => this.temEstoque(produto)) ?? null;
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private lojaDataSource: LojaDataSource,
        private midiaDataSource: ReferenciaMidiaPublicaDataSource,
        private carrinhoFacadeService: CarrinhoFacadeService,
        private toastService: ToastService,
        private promocaoPrecoService: PromocaoPrecoService,
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(async (params) => {
            const id = params.get('id') ?? '';
            await this.carregar(id);
        });
    }

    private async carregar(id: string): Promise<void> {
        this.loading.set(true);
        this.erro.set('');
        this.adicionado.set(false);

        if (!id) {
            this.erro.set('Produto não informado.');
            this.loading.set(false);
            return;
        }

        try {
            // referencia/produtos usam o id de rota (ecommerceReferenciaId). Mídias usam o
            // referenciaId real do produto, que só vem dentro de `referencia` -- por isso
            // busca mídias só depois, com `referencia.referenciaId`, não com `id`.
            const [referencia, produtos, promocoes] = await Promise.all([
                firstValueFrom(this.lojaDataSource.buscarReferencia(id)),
                firstValueFrom(this.lojaDataSource.listarProdutos(id)),
                firstValueFrom(this.lojaDataSource.promocoesAtivas()).catch(() => ({ items: [] })),
            ]);
            const midias = await firstValueFrom(this.midiaDataSource.listar(referencia.referenciaId.toString()))
                .catch(() => [] as ReferenciaMidiaDto[]);

            this.referencia.set(referencia);
            this.produtos.set(produtos);
            this.valorPromocional.set(
                this.promocaoPrecoService.calcularParaReferencia(
                    referencia.referenciaId,
                    referencia.valor,
                    this.promocaoPrecoService.montarMapa(promocoes.items),
                    this.promocaoPrecoService.promocoesGerais(promocoes.items),
                ) ?? undefined,
            );
            const midiasComUrl = midias.filter((midia) => midia?.url);
            this.midias.set(midiasComUrl);
            this.fotoSelecionada.set(midiasComUrl.find((midia) => midia.isDefault) ?? midiasComUrl[0] ?? null);
            this.resetarZoom();
            this.rolarThumbParaAtiva();

            this.itensNoCarrinho.set(await this.carrinhoFacadeService.contarItens());

            this.quantidade.set(1);
            const disponiveis = produtos.filter((produto) => this.temEstoque(produto));
            if (disponiveis.length === 1) {
                this.corSelecionada.set(disponiveis[0].corNome);
                this.tamanhoSelecionado.set(disponiveis[0].tamanhoNome);
                this.estampaSelecionada.set(disponiveis[0].estampaNome ?? null);
            }
            setTimeout(() => {
                this.atualizarSetasCor();
                this.atualizarSetasTamanho();
                this.atualizarSetasEstampa();
            });
        } catch (error) {
            console.error('Erro ao carregar referência da loja', error);
            this.erro.set('Não foi possível carregar este produto no momento.');
        } finally {
            this.loading.set(false);
        }
    }

    selecionarMidia(midia: ReferenciaMidiaDto): void {
        this.fotoSelecionada.set(midia);
        this.resetarZoom();
        this.rolarThumbParaAtiva();
    }

    indiceFotoAtual(): number {
        return this.midias().findIndex((midia) => midia === this.fotoSelecionada());
    }

    fotoAnterior(): void {
        const lista = this.midias();
        const indice = this.indiceFotoAtual();
        if (indice > 0) {
            this.selecionarMidia(lista[indice - 1]);
        }
    }

    fotoProxima(): void {
        const lista = this.midias();
        const indice = this.indiceFotoAtual();
        if (indice >= 0 && indice < lista.length - 1) {
            this.selecionarMidia(lista[indice + 1]);
        }
    }

    private resetarZoom(): void {
        this.zoomAtivo.set(false);
        this.panX.set(0);
        this.panY.set(0);
    }

    toggleZoom(): void {
        this.zoomAtivo.update((ativo) => !ativo);
        this.panX.set(0);
        this.panY.set(0);
    }

    // Um único handler de pointer serve pra dois gestos, diferenciados só no fim (pointerup):
    // - sem zoom: arrasto horizontal grande -> troca de foto (swipe).
    // - com zoom: arrasto livre -> pan (desloca a imagem ampliada).
    // - qualquer um com deslocamento pequeno -> tap -> alterna zoom.
    onFotoPointerDown(event: PointerEvent): void {
        this.gestoAtivo = true;
        this.gestoMoveu = false;
        this.gestoOrigemX = event.clientX;
        this.gestoOrigemY = event.clientY;
        this.panOrigemX = this.panX();
        this.panOrigemY = this.panY();
    }

    onFotoPointerMove(event: PointerEvent): void {
        if (!this.gestoAtivo) {
            return;
        }
        const deltaX = event.clientX - this.gestoOrigemX;
        const deltaY = event.clientY - this.gestoOrigemY;
        if (Math.abs(deltaX) > LojaReferenciaPage.LIMIAR_TAP_PX || Math.abs(deltaY) > LojaReferenciaPage.LIMIAR_TAP_PX) {
            this.gestoMoveu = true;
        }
        if (this.zoomAtivo()) {
            event.preventDefault();
            this.panX.set(this.panOrigemX + deltaX);
            this.panY.set(this.panOrigemY + deltaY);
        }
    }

    onFotoPointerUp(event: PointerEvent): void {
        if (!this.gestoAtivo) {
            return;
        }
        this.gestoAtivo = false;
        const deltaX = event.clientX - this.gestoOrigemX;

        if (!this.gestoMoveu) {
            this.toggleZoom();
            return;
        }

        if (!this.zoomAtivo() && Math.abs(deltaX) > LojaReferenciaPage.LIMIAR_SWIPE_PX) {
            if (deltaX > 0) {
                this.fotoAnterior();
            } else {
                this.fotoProxima();
            }
        }
    }

    private rolarThumbParaAtiva(): void {
        setTimeout(() => {
            const container = this.thumbListaRef?.nativeElement;
            const ativo = container?.querySelector('.thumb.ativo') as HTMLElement | null;
            ativo?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            this.atualizarSetasThumb();
        });
    }

    rolarThumb(direcao: 1 | -1): void {
        this.rolar(this.thumbListaRef, direcao);
    }

    atualizarSetasThumb(): void {
        this.atualizarSetas(this.thumbListaRef, this.podeRolarThumbEsquerda, this.podeRolarThumbDireita);
    }

    rolarCor(direcao: 1 | -1): void {
        this.rolar(this.corListaRef, direcao);
    }

    atualizarSetasCor(): void {
        this.atualizarSetas(this.corListaRef, this.podeRolarCorEsquerda, this.podeRolarCorDireita);
    }

    rolarTamanho(direcao: 1 | -1): void {
        this.rolar(this.tamanhoListaRef, direcao);
    }

    atualizarSetasTamanho(): void {
        this.atualizarSetas(this.tamanhoListaRef, this.podeRolarTamanhoEsquerda, this.podeRolarTamanhoDireita);
    }

    rolarEstampa(direcao: 1 | -1): void {
        this.rolar(this.estampaListaRef, direcao);
    }

    atualizarSetasEstampa(): void {
        this.atualizarSetas(this.estampaListaRef, this.podeRolarEstampaEsquerda, this.podeRolarEstampaDireita);
    }

    // Mesma lógica de rolagem/detecção de fim de tira, reaproveitada pelas 3 tiras horizontais
    // (fotos, cores, tamanhos) -- só muda a ref e os signals.
    private rolar(ref: ElementRef<HTMLElement> | undefined, direcao: 1 | -1): void {
        ref?.nativeElement.scrollBy({ left: direcao * 160, behavior: 'smooth' });
    }

    private atualizarSetas(
        ref: ElementRef<HTMLElement> | undefined,
        podeEsquerda: ReturnType<typeof signal<boolean>>,
        podeDireita: ReturnType<typeof signal<boolean>>,
    ): void {
        const container = ref?.nativeElement;
        if (!container) {
            return;
        }
        podeEsquerda.set(container.scrollLeft > 4);
        podeDireita.set(container.scrollLeft + container.clientWidth < container.scrollWidth - 4);
    }

    selecionarCor(cor: string): void {
        if (!this.corDisponivel(cor)) {
            return;
        }
        this.mensagemValidacao.set(null);
        this.corSelecionada.set(cor);
        this.tamanhoSelecionado.set(null);
        this.estampaSelecionada.set(null);
        this.quantidade.set(1);
        this.adicionado.set(false);
        // Lista de tamanhos/estampas muda de conteúdo (filtrada pela cor) -- recalcula depois do DOM
        // atualizar.
        setTimeout(() => {
            this.atualizarSetasTamanho();
            this.atualizarSetasEstampa();
        });
    }

    selecionarTamanho(tamanho: string): void {
        if (!this.tamanhoDisponivel(tamanho)) {
            return;
        }
        this.mensagemValidacao.set(null);
        this.tamanhoSelecionado.set(tamanho);
        this.estampaSelecionada.set(null);
        this.quantidade.set(1);
        this.adicionado.set(false);
        setTimeout(() => this.atualizarSetasEstampa());
    }

    selecionarEstampa(estampa: string): void {
        if (!this.estampaDisponivel(estampa)) {
            return;
        }
        this.mensagemValidacao.set(null);
        this.estampaSelecionada.set(estampa);
        this.quantidade.set(1);
        this.adicionado.set(false);
        this.aplicarFotoParaEstampa(estampa);
    }

    // Fotos da referência podem indicar a qual estampa pertencem (ReferenciaMediaEntity.estampa,
    // texto livre, mesmo padrão de cor/tamanho). Ao trocar de estampa, troca a foto principal pra
    // uma que bata (comparação exata do nome); sem match, volta pra foto padrão em vez de manter
    // uma foto de estampa errada na tela.
    private aplicarFotoParaEstampa(estampa: string): void {
        const midias = this.midias();
        const correspondente = midias.find((midia) => midia.estampa === estampa);
        const alvo = correspondente ?? midias.find((midia) => midia.isDefault) ?? midias[0] ?? null;
        if (alvo) {
            this.selecionarMidia(alvo);
        }
    }

    // Retorna true quando pode seguir (produto totalmente selecionado). Quando falta cor/tamanho,
    // mostra mensagem específica perto do seletor e rola até lá -- não depende só do botão
    // desabilitado (que muitas vezes passa despercebido).
    private validarSelecao(): boolean {
        if (this.produtosDisponiveis().length === 0) {
            return false; // sem estoque em nenhuma combinação -- aviso "indisponível" já cobre isso
        }
        if (!this.corSelecionada()) {
            this.mensagemValidacao.set('Selecione uma cor.');
            this.secaoCorRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
        if (!this.tamanhoSelecionado()) {
            this.mensagemValidacao.set('Selecione um tamanho.');
            this.secaoTamanhoRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
        if (this.referenciaTemEstampa() && !this.estampaSelecionada()) {
            this.mensagemValidacao.set('Selecione uma estampa.');
            this.secaoEstampaRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
        if (!this.produtoSelecionado()) {
            this.mensagemValidacao.set('Essa combinação está indisponível no momento.');
            return false;
        }
        this.mensagemValidacao.set(null);
        return true;
    }

    formatarPreco(valor: number | undefined): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    incrementarQuantidade(): void {
        const produto = this.produtoSelecionado();
        const max = produto?.quantidadeDisponivel ?? produto?.saldo ?? 1;
        this.quantidade.update((atual) => Math.min(atual + 1, max));
    }

    decrementarQuantidade(): void {
        this.quantidade.update((atual) => Math.max(atual - 1, 1));
    }

    comprarAgora(): void {
        if (!this.validarSelecao()) {
            return;
        }
        const produto = this.produtoSelecionado()!;
        this.router.navigate(['/checkout'], { state: { produtoId: produto.produtoId, quantidade: this.quantidade() } });
    }

    async adicionarAoCarrinho(): Promise<void> {
        if (!this.validarSelecao()) {
            return;
        }
        const produto = this.produtoSelecionado()!;

        this.adicionando.set(true);
        try {
            await this.carrinhoFacadeService.adicionar(produto.produtoId, this.quantidade());
            this.adicionado.set(true);
            this.itensNoCarrinho.set(await this.carrinhoFacadeService.contarItens());
            this.toastService.show('Produto adicionado à sacola', 'success');
        } finally {
            this.adicionando.set(false);
        }
    }

    irParaCarrinho(): void {
        this.router.navigate(['/carrinho']);
    }
}
