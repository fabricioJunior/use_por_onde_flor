import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild, signal, computed } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { firstValueFrom } from "rxjs";
import { LojaDataSource } from "../../../data/loja.data.source";
import { ReferenciaMidiaPublicaDataSource } from "../../../data/referencia.midia.publica.data.source";
import { EcommerceReferenciaDto, EcommerceReferenciaProdutoDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { ReferenciaMidiaDto } from "../../../../referencias/data/referencia.data.source";
import { CarrinhoFacadeService } from "../../../../carrinho/services/carrinho.facade.service";
import { ButtonComponent } from "../../components/ui/button/button.component";
import { ToastService } from "../../components/ui/toast/toast.service";
import { corEhClara, corParaHex, normalizarNomeCor } from "../../utils/cor-apresentacao.util";

@Component({
    selector: 'loja-referencia-page',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule, ButtonComponent],
    templateUrl: './loja.referencia.page.html',
    styleUrl: './loja.referencia.page.css',
})
export class LojaReferenciaPage implements OnInit {
    @ViewChild('secaoCor') secaoCorRef?: ElementRef<HTMLElement>;
    @ViewChild('secaoTamanho') secaoTamanhoRef?: ElementRef<HTMLElement>;

    loading = signal(true);
    erro = signal('');
    referencia = signal<EcommerceReferenciaDto | null>(null);
    produtos = signal<EcommerceReferenciaProdutoDto[]>([]);
    midias = signal<ReferenciaMidiaDto[]>([]);
    fotoSelecionada = signal<ReferenciaMidiaDto | null>(null);

    corSelecionada = signal<string | null>(null);
    tamanhoSelecionado = signal<string | null>(null);
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

    produtosDisponiveis = computed(() => this.produtos().filter((produto) => produto.disponivel));

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

    corHex(cor: string): string | null {
        return corParaHex(normalizarNomeCor(cor));
    }

    corEhClara(cor: string): boolean {
        return corEhClara(this.corHex(cor));
    }

    corDisponivel(cor: string): boolean {
        return this.produtos().some((produto) => produto.corNome === cor && produto.disponivel);
    }

    tamanhoDisponivel(tamanho: string): boolean {
        const cor = this.corSelecionada();
        return this.produtos().some((produto) =>
            (!cor || produto.corNome === cor) && produto.tamanhoNome === tamanho && produto.disponivel,
        );
    }

    produtoSelecionado = computed(() => {
        const cor = this.corSelecionada();
        const tamanho = this.tamanhoSelecionado();
        const candidatos = this.produtos().filter((produto) =>
            (!cor || produto.corNome === cor) && (!tamanho || produto.tamanhoNome === tamanho),
        );
        return candidatos.find((produto) => produto.disponivel) ?? null;
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private lojaDataSource: LojaDataSource,
        private midiaDataSource: ReferenciaMidiaPublicaDataSource,
        private carrinhoFacadeService: CarrinhoFacadeService,
        private toastService: ToastService,
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
            const [referencia, produtos] = await Promise.all([
                firstValueFrom(this.lojaDataSource.buscarReferencia(id)),
                firstValueFrom(this.lojaDataSource.listarProdutos(id)),
            ]);
            const midias = await firstValueFrom(this.midiaDataSource.listar(referencia.referenciaId.toString()))
                .catch(() => [] as ReferenciaMidiaDto[]);

            this.referencia.set(referencia);
            this.produtos.set(produtos);
            const midiasComUrl = midias.filter((midia) => midia?.url);
            this.midias.set(midiasComUrl);
            this.fotoSelecionada.set(midiasComUrl.find((midia) => midia.isDefault) ?? midiasComUrl[0] ?? null);

            this.quantidade.set(1);
            const disponiveis = produtos.filter((produto) => produto.disponivel);
            if (disponiveis.length === 1) {
                this.corSelecionada.set(disponiveis[0].corNome);
                this.tamanhoSelecionado.set(disponiveis[0].tamanhoNome);
            }
        } catch (error) {
            console.error('Erro ao carregar referência da loja', error);
            this.erro.set('Não foi possível carregar este produto no momento.');
        } finally {
            this.loading.set(false);
        }
    }

    selecionarMidia(midia: ReferenciaMidiaDto): void {
        this.fotoSelecionada.set(midia);
    }

    selecionarCor(cor: string): void {
        if (!this.corDisponivel(cor)) {
            return;
        }
        this.mensagemValidacao.set(null);
        this.corSelecionada.set(cor);
        this.tamanhoSelecionado.set(null);
        this.quantidade.set(1);
    }

    selecionarTamanho(tamanho: string): void {
        if (!this.tamanhoDisponivel(tamanho)) {
            return;
        }
        this.mensagemValidacao.set(null);
        this.tamanhoSelecionado.set(tamanho);
        this.quantidade.set(1);
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
        const max = this.produtoSelecionado()?.saldo ?? 1;
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
            this.toastService.show('Produto adicionado à sacola', 'success');
        } finally {
            this.adicionando.set(false);
        }
    }

    irParaCarrinho(): void {
        this.router.navigate(['/carrinho']);
    }
}
