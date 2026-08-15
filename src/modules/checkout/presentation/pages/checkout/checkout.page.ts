import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";
import { cpf } from "cpf-cnpj-validator";
import { debounceTime, distinctUntilChanged, firstValueFrom } from "rxjs";
import { CarrinhoFacadeService } from "../../../../carrinho/services/carrinho.facade.service";
import { CarrinhoDataSource } from "../../../../carrinho/data/carrinho.data.source";
import { CarrinhoItemViewDto } from "../../../../carrinho/data/dtos/carrinho-item-view.dto";
import { AutenticacaoService } from "../../../../autenticacao/services/autenticacao.service";
import { LocalStorageService } from "../../../../core/local_storage/local-storage.service";
import { UsuarioDto } from "../../../../autenticacao/data/dto/usuario.dto";
import { LojaDataSource } from "../../../../loja/data/loja.data.source";
import { CheckoutDataSource } from "../../../data/checkout.data.source";
import { EnderecoDataSource } from "../../../data/endereco.data.source";
import { EnderecoDto } from "../../../data/dtos/endereco.dto";
import { CheckoutCobrancaDto, ModalidadeEntregaPedido } from "../../../data/dtos/checkout.dto";
import { OpcaoFreteDto } from "../../../data/dtos/frete.dto";
import { ButtonComponent } from "../../../../loja/presentation/components/ui/button/button.component";
import { HeaderComponent } from "../../../../loja/presentation/components/header/header.component";

const CEP_VALIDO = /^\d{5}-?\d{3}$/;

function cpfValidator(control: { value: string }) {
    if (!control.value) {
        return null;
    }
    return cpf.isValid(control.value) ? null : { cpfInvalido: true };
}

@Component({
    selector: 'checkout-page',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule, NgxMaskDirective, MatProgressSpinnerModule, ClipboardModule, ButtonComponent, HeaderComponent],
    templateUrl: './checkout.page.html',
    styleUrl: './checkout.page.css',
    providers: [provideNgxMask()],
})
export class CheckoutPage implements OnInit {
    loading = signal(true);
    finalizando = signal(false);
    erro = signal('');
    lojaFechada = signal(false);
    itens = signal<CarrinhoItemViewDto[]>([]);
    // Presente quando veio do botão "Comprar agora" (ver LojaReferenciaPage/ProdutoCardComponent) --
    // nesse caso `itens` não vem do carrinho persistido, é só esse produto, e o carrinho salvo da
    // pessoa não deve ser tocado (nem lido, nem limpo) no finalizar().
    private compraDireta: { produtoId: number; quantidade: number } | null = null;
    enderecos = signal<EnderecoDto[]>([]);
    enderecoSelecionadoId = signal<number | null>(null);
    mostrarNovoEndereco = signal(false);
    resposta = signal<{ pedidoId: number; cobranca?: CheckoutCobrancaDto } | null>(null);

    autenticado: boolean;

    opcoesFrete = signal<OpcaoFreteDto[]>([]);
    freteSelecionado = signal<OpcaoFreteDto | null>(null);
    carregandoFrete = signal(false);
    erroFrete = signal('');
    private ultimoCepCotado = '';

    valorFrete = computed(() => {
        const frete = this.freteSelecionado();
        return frete ? frete.customPrice ?? frete.price : 0;
    });

    total = computed(() =>
        this.itens().reduce((soma, item) => soma + (item.valorPromocional ?? item.valor ?? 0) * (item.quantidade ?? 0), 0) + this.valorFrete(),
    );

    clienteForm: ReturnType<FormBuilder['group']>;
    enderecoForm: ReturnType<FormBuilder['group']>;

    modalidadeEntrega = signal<ModalidadeEntregaPedido>('retirada');

    formasPagamento = signal<{ formaDePagamentoId: number; descricao: string; provider?: string }[]>([]);
    formaPagamentoSelecionadaId = signal<number | null>(null);

    constructor(
        private formBuilder: FormBuilder,
        private carrinhoFacadeService: CarrinhoFacadeService,
        private carrinhoDataSource: CarrinhoDataSource,
        private autenticacaoService: AutenticacaoService,
        private localStorageService: LocalStorageService,
        private lojaDataSource: LojaDataSource,
        private checkoutDataSource: CheckoutDataSource,
        private enderecoDataSource: EnderecoDataSource,
        private http: HttpClient,
        public router: Router,
    ) {
        this.autenticado = this.autenticacaoService.estaAutenticado();

        // getCurrentNavigation() só existe durante a navegação em si -- precisa ler aqui no
        // constructor, no ngOnInit já voltaria null.
        const state = this.router.getCurrentNavigation()?.extras?.state as { produtoId?: number; quantidade?: number } | undefined;
        if (state?.produtoId != null && state.quantidade != null) {
            this.compraDireta = { produtoId: state.produtoId, quantidade: state.quantidade };
        }

        this.clienteForm = this.formBuilder.group({
            nome: ['', Validators.required],
            documento: ['', [Validators.required, cpfValidator]],
            email: ['', [Validators.required, Validators.email]],
            telefone: ['', Validators.required],
        });

        this.enderecoForm = this.formBuilder.group({
            cep: [''],
            logradouro: ['', Validators.required],
            numero: ['', Validators.required],
            complemento: [''],
            bairro: ['', Validators.required],
            municipio: ['', Validators.required],
            uf: ['', Validators.required],
        });

        // Só recalcula quando o CEP muda de verdade (não em toda tecla de logradouro/número/etc) --
        // evita chamada à toa a cada alteração irrelevante do formulário.
        this.enderecoForm.get('cep')!.valueChanges
            .pipe(debounceTime(600), distinctUntilChanged())
            .subscribe((cep) => this.calcularFrete(cep));

        this.enderecoForm.get('cep')!.valueChanges
            .pipe(debounceTime(600), distinctUntilChanged())
            .subscribe((cep) => this.preencherEnderecoPorCep(cep));
    }

    // ViaCEP -- direto do browser (sem passar pela nossa API), mesmo padrão de urls externas já
    // aceito pelo ApiBaseUrlInterceptor (bypassa quando a url contém "http"). Só preenche
    // logradouro/bairro/município/UF -- número/complemento continuam livres pro cliente digitar.
    // Silencioso em qualquer falha (CEP incompleto, não encontrado, API fora do ar): cliente
    // sempre pode preencher manualmente, isso é só uma ajuda.
    private async preencherEnderecoPorCep(cepBruto: string | null | undefined): Promise<void> {
        const cep = (cepBruto ?? '').replace(/\D/g, '');
        if (cep.length !== 8) {
            return;
        }

        try {
            const resultado = await firstValueFrom(this.http.get<{
                erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string;
            }>(`https://viacep.com.br/ws/${cep}/json/`));

            if (resultado.erro) {
                return;
            }

            this.enderecoForm.patchValue({
                logradouro: resultado.logradouro || this.enderecoForm.get('logradouro')!.value,
                bairro: resultado.bairro || this.enderecoForm.get('bairro')!.value,
                municipio: resultado.localidade || this.enderecoForm.get('municipio')!.value,
                uf: resultado.uf || this.enderecoForm.get('uf')!.value,
            });
        } catch (error) {
            console.error('Erro ao buscar endereço pelo CEP', error);
        }
    }

    async ngOnInit(): Promise<void> {
        this.loading.set(true);
        try {
            // Chamadas separadas: falha em status() (ex: loja sem caixa configurado) não pode
            // esconder os itens da sacola, que vêm de uma fonte totalmente independente.
            let itens = this.compraDireta
                ? await this.carregarItemCompraDireta(this.compraDireta)
                : await this.carrinhoFacadeService.listar();

            // Carrinho persistido (logado) pode ter item que ficou sem saldo desde que foi
            // adicionado -- valida e remove antes de deixar seguir pro pagamento, em vez de só
            // descobrir no 400 do POST /checkout.
            if (this.autenticado && !this.compraDireta) {
                const { itensRemovidos } = await firstValueFrom(this.carrinhoDataSource.validar());
                if (itensRemovidos.length > 0) {
                    itens = await this.carrinhoFacadeService.listar();
                    this.erro.set(`Alguns itens saíram da sacola por falta de estoque: ${itensRemovidos.map((i) => i.motivo).join(', ')}`);
                }
            }

            this.itens.set(itens);

            try {
                const status = await firstValueFrom(this.lojaDataSource.status());
                this.lojaFechada.set(!status.aberto);
            } catch (statusError) {
                console.error('Erro ao consultar status da loja', statusError);
                this.lojaFechada.set(false);
            }

            try {
                const formas = await firstValueFrom(this.lojaDataSource.formaPagamento());
                this.formasPagamento.set(formas);
                if (formas.length === 1) {
                    this.formaPagamentoSelecionadaId.set(formas[0].formaDePagamentoId);
                    await this.atualizarPrecosPorFormaPagamento(formas[0].formaDePagamentoId);
                }
            } catch (formaPagamentoError) {
                console.error('Erro ao consultar formas de pagamento', formaPagamentoError);
                this.formasPagamento.set([]);
            }

            if (this.autenticado) {
                const pessoa = this.localStorageService.get<UsuarioDto>('usuario_da_sessao') as UsuarioDto | null;
                if (pessoa?.id) {
                    const enderecos = await firstValueFrom(this.enderecoDataSource.listar());
                    this.enderecos.set(enderecos);
                    const principal = enderecos.find((endereco) => endereco.principal) ?? enderecos[0];
                    if (principal?.id) {
                        this.enderecoSelecionadoId.set(principal.id);
                    } else {
                        this.mostrarNovoEndereco.set(true);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao preparar checkout', error);
            this.erro.set('Não foi possível carregar os dados do checkout.');
        } finally {
            this.loading.set(false);
        }
    }

    private async carregarItemCompraDireta(compra: { produtoId: number; quantidade: number }): Promise<CarrinhoItemViewDto[]> {
        const detalhe = await firstValueFrom(this.lojaDataSource.produto(compra.produtoId));
        return [{ ...detalhe, quantidade: compra.quantidade }];
    }

    selecionarModalidade(modalidade: ModalidadeEntregaPedido): void {
        this.modalidadeEntrega.set(modalidade);

        if (modalidade === 'retirada') {
            this.opcoesFrete.set([]);
            this.freteSelecionado.set(null);
            this.erroFrete.set('');
            return;
        }

        const cepAtual = this.mostrarNovoEndereco()
            ? this.enderecoForm.get('cep')!.value
            : this.enderecos().find((endereco) => endereco.id === this.enderecoSelecionadoId())?.cep;
        this.calcularFrete(cepAtual);
    }

    selecionarEndereco(endereco: EnderecoDto): void {
        this.enderecoSelecionadoId.set(endereco.id!);
        this.calcularFrete(endereco.cep);
    }

    selecionarFrete(opcao: OpcaoFreteDto): void {
        this.freteSelecionado.set(opcao);
    }

    private async calcularFrete(cepBruto: string | null | undefined): Promise<void> {
        const cep = (cepBruto ?? '').trim();
        this.erroFrete.set('');

        if (!CEP_VALIDO.test(cep)) {
            this.opcoesFrete.set([]);
            this.freteSelecionado.set(null);
            return;
        }

        if (cep === this.ultimoCepCotado) {
            return;
        }
        this.ultimoCepCotado = cep;

        if (this.itens().length === 0) {
            return;
        }

        this.carregandoFrete.set(true);
        this.freteSelecionado.set(null);
        try {
            const opcoes = await firstValueFrom(this.checkoutDataSource.cotarFrete({
                itens: this.itens().map((item) => ({ produtoId: item.produtoId!, quantidade: item.quantidade! })),
                cepDestino: cep,
            }));
            this.opcoesFrete.set(opcoes);
            if (opcoes.length === 1) {
                this.freteSelecionado.set(opcoes[0]);
            } else if (opcoes.length === 0) {
                this.erroFrete.set('Nenhuma opção de frete disponível para esse CEP.');
            }
        } catch (error) {
            console.error('Erro ao cotar frete', error);
            this.opcoesFrete.set([]);
            this.erroFrete.set('Não foi possível calcular o frete pra esse CEP. Tente novamente.');
        } finally {
            this.carregandoFrete.set(false);
        }
    }

    formatarPreco(valor: number | undefined): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    private montarEnderecoInline() {
        const valores = this.enderecoForm.getRawValue();
        return {
            principal: true,
            tipoEndereco: 'Residencial' as const,
            cep: valores.cep ?? undefined,
            logradouro: valores.logradouro ?? undefined,
            numero: valores.numero ?? undefined,
            complemento: valores.complemento ?? undefined,
            bairro: valores.bairro ?? undefined,
            municipio: valores.municipio ?? undefined,
            uf: (valores.uf as any) ?? undefined,
        };
    }

    podeFinalizar(): boolean {
        return this.pendencias().length === 0;
    }

    private static readonly LABEL_CAMPO: Record<string, string> = {
        nome: 'Nome completo',
        documento: 'CPF',
        email: 'E-mail',
        telefone: 'Telefone',
        logradouro: 'Logradouro',
        numero: 'Número',
        bairro: 'Bairro',
        municipio: 'Cidade',
        uf: 'UF',
    };

    // Reaproveitada pelo botão (desabilita) e pela lista de avisos (explica o que falta) -- mesma
    // regra em um lugar só, senão os dois podem divergir silenciosamente.
    pendencias(): string[] {
        if (this.itens().length === 0 || this.lojaFechada()) {
            return [];
        }

        const pendencias: string[] = [];

        if (!this.autenticado) {
            pendencias.push(...this.camposInvalidos(this.clienteForm));
        }

        if (this.modalidadeEntrega() === 'entrega') {
            if (this.mostrarNovoEndereco() || !this.autenticado) {
                pendencias.push(...this.camposInvalidos(this.enderecoForm));
            } else if (this.enderecoSelecionadoId() == null) {
                pendencias.push('Selecione um endereço de entrega.');
            }
            if (!this.freteSelecionado()) {
                pendencias.push('Selecione uma opção de frete.');
            }
        }

        if (this.formasPagamento().length > 1 && this.formaPagamentoSelecionadaId() == null) {
            pendencias.push('Selecione uma forma de pagamento.');
        }

        return pendencias;
    }

    async selecionarFormaPagamento(formaDePagamentoId: number): Promise<void> {
        this.formaPagamentoSelecionadaId.set(formaDePagamentoId);
        await this.atualizarPrecosPorFormaPagamento(formaDePagamentoId);
    }

    // Desconto de promoção pode variar por forma de pagamento (restringirFormasPagamento/override
    // em promocao_forma_pagamento, ver EcommerceCheckoutService.montarItensComDesconto) -- recotar
    // sempre que a escolha mudar, senão o valor exibido não bate com o que o backend vai cobrar.
    private async atualizarPrecosPorFormaPagamento(formaDePagamentoId: number): Promise<void> {
        if (this.itens().length === 0) {
            return;
        }
        try {
            const cotacao = await firstValueFrom(this.checkoutDataSource.cotar({
                itens: this.itens().map((item) => ({ produtoId: item.produtoId!, quantidade: item.quantidade! })),
                formaDePagamentoId,
            }));
            this.itens.set(this.itens().map((item) => {
                const precoItem = cotacao.itens.find((i) => i.produtoId === item.produtoId);
                return precoItem ? { ...item, valor: precoItem.valor, valorPromocional: precoItem.valorPromocional } : item;
            }));
        } catch (error) {
            console.error('Erro ao recalcular preço pra forma de pagamento selecionada', error);
        }
    }

    private camposInvalidos(form: ReturnType<FormBuilder['group']>): string[] {
        return Object.entries(form.controls)
            .filter(([, controle]) => controle.invalid)
            .map(([nome]) => `Preencha: ${CheckoutPage.LABEL_CAMPO[nome] ?? nome}.`);
    }

    async finalizar(): Promise<void> {
        if (!this.podeFinalizar() || this.finalizando()) {
            return;
        }

        this.finalizando.set(true);
        this.erro.set('');

        try {
            let enderecoEntregaId: number | undefined;
            let enderecoEntrega: ReturnType<typeof this.montarEnderecoInline> | undefined;

            if (this.modalidadeEntrega() === 'entrega') {
                if (!this.autenticado) {
                    // Guest nunca tem pessoa antes do checkout -- não dá pra pré-criar endereço
                    // (exige pessoaId existente). Manda os dados brutos, o backend cria pessoa +
                    // endereço antes do pedido (ver EcommerceCheckoutService.checkout).
                    enderecoEntrega = this.montarEnderecoInline();
                } else if (this.mostrarNovoEndereco()) {
                    const valores = this.enderecoForm.getRawValue();
                    const novoEndereco = await firstValueFrom(this.enderecoDataSource.criar({
                        principal: this.enderecos().length === 0,
                        tipoEndereco: 'Residencial',
                        cep: valores.cep ?? undefined,
                        logradouro: valores.logradouro ?? undefined,
                        numero: valores.numero ?? undefined,
                        complemento: valores.complemento ?? undefined,
                        bairro: valores.bairro ?? undefined,
                        municipio: valores.municipio ?? undefined,
                        uf: (valores.uf as any) ?? undefined,
                    }));
                    enderecoEntregaId = novoEndereco.id;
                } else {
                    enderecoEntregaId = this.enderecoSelecionadoId() ?? undefined;
                }
            }

            // itens explícito sempre que guest OU "comprar agora" (mesmo logado, pra não
            // sobrescrever/limpar o carrinho salvo -- ver EcommerceCheckoutService.checkout no
            // apollo-api). Só omite (backend usa o carrinho persistido) no checkout normal logado.
            const enviarItensExplicitos = !this.autenticado || !!this.compraDireta;

            const resposta = await firstValueFrom(this.checkoutDataSource.finalizar({
                itens: enviarItensExplicitos ? this.itens().map((item) => ({ produtoId: item.produtoId!, quantidade: item.quantidade! })) : undefined,
                cliente: this.autenticado ? undefined : this.clienteForm.getRawValue() as any,
                modalidadeEntrega: this.modalidadeEntrega(),
                enderecoEntregaId,
                enderecoEntrega,
                freteEscolhido: this.freteSelecionado() ?? undefined,
                formaDePagamentoId: this.formaPagamentoSelecionadaId() ?? undefined,
            }));

            this.carrinhoFacadeService.limparLocal();

            if (resposta.cobranca?.urlDePagamento && typeof window !== 'undefined') {
                document.location.href = resposta.cobranca.urlDePagamento;
                return;
            }

            if (resposta.cobranca?.qrCodePix || resposta.cobranca?.chavePixCopiaECola) {
                this.resposta.set(resposta);
                return;
            }

            this.router.navigate(['/pagamento'], { queryParams: { pedidoId: resposta.pedidoId } });
        } catch (error) {
            console.error('Erro ao finalizar checkout', error);
            const mensagemApi = (error as any)?.error?.message;
            this.erro.set(typeof mensagemApi === 'string' ? mensagemApi : 'Não foi possível finalizar seu pedido. Tente novamente.');
        } finally {
            this.finalizando.set(false);
        }
    }

    irParaConfirmacao(): void {
        const pedidoId = this.resposta()?.pedidoId;
        this.router.navigate(['/pagamento'], { queryParams: { pedidoId } });
    }
}
