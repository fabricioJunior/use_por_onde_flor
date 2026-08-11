import { CommonModule } from "@angular/common";
import { Component, OnInit, signal, computed } from "@angular/core";
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

@Component({
    selector: 'loja-referencia-page',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule, ButtonComponent],
    templateUrl: './loja.referencia.page.html',
    styleUrl: './loja.referencia.page.css',
})
export class LojaReferenciaPage implements OnInit {
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

    produtosDisponiveis = computed(() => this.produtos().filter((produto) => produto.disponivel));

    cores = computed(() => Array.from(new Set(this.produtosDisponiveis().map((produto) => produto.corNome).filter(Boolean))));

    tamanhosParaCorAtual = computed(() => {
        const cor = this.corSelecionada();
        return Array.from(new Set(
            this.produtosDisponiveis()
                .filter((produto) => !cor || produto.corNome === cor)
                .map((produto) => produto.tamanhoNome)
                .filter(Boolean),
        ));
    });

    produtoSelecionado = computed(() => {
        const cor = this.corSelecionada();
        const tamanho = this.tamanhoSelecionado();
        return this.produtosDisponiveis().find((produto) =>
            (!cor || produto.corNome === cor) && (!tamanho || produto.tamanhoNome === tamanho),
        ) ?? null;
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
            const [referencia, produtos, midias] = await Promise.all([
                firstValueFrom(this.lojaDataSource.buscarReferencia(id)),
                firstValueFrom(this.lojaDataSource.listarProdutos(id)),
                firstValueFrom(this.midiaDataSource.listar(id)).catch(() => [] as ReferenciaMidiaDto[]),
            ]);

            this.referencia.set(referencia);
            this.produtos.set(produtos);
            const midiasComUrl = midias.filter((midia) => midia?.url);
            this.midias.set(midiasComUrl);
            this.fotoSelecionada.set(midiasComUrl.find((midia) => midia.isDefault) ?? midiasComUrl[0] ?? null);

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
        this.corSelecionada.set(cor);
        this.tamanhoSelecionado.set(null);
    }

    selecionarTamanho(tamanho: string): void {
        this.tamanhoSelecionado.set(tamanho);
    }

    formatarPreco(valor: number | undefined): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    async adicionarAoCarrinho(): Promise<void> {
        const produto = this.produtoSelecionado();
        if (!produto) {
            return;
        }

        this.adicionando.set(true);
        try {
            await this.carrinhoFacadeService.adicionar(produto.produtoId, 1);
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
