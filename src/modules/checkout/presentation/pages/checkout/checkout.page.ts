import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, computed, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
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
import { PedidosService } from "../../../../pedidos/services/pedidos.service";

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
    imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, NgxMaskDirective, MatProgressSpinnerModule, ClipboardModule, ButtonComponent, HeaderComponent],
    templateUrl: './checkout.page.html',
    styleUrl: './checkout.page.css',
    providers: [provideNgxMask()],
})
export class CheckoutPage implements OnInit, OnDestroy {
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
    resposta = signal<{ pedidoId: number; cobranca?: CheckoutCobrancaDto; tokenAcesso?: string; expiraReservaEm?: string } | null>(null);
    // Contagem regressiva pro Pix (RESERVA_ESTOQUE_TTL_MINUTOS, ver resposta.expiraReservaEm) --
    // atualizada a cada segundo por um único setInterval (this.timerPagamento) que também dispara
    // o polling de confirmação de pagamento e, ao zerar, cancela o pedido e volta pra sacola.
    segundosRestantes = signal<number | null>(null);
    private timerPagamento?: ReturnType<typeof setInterval>;
    private expiraEmMs?: number;
    private expirandoPedido = false;
    // Referência da popup de checkout hospedado (InfinityPay/cartão, ver finalizar()) -- fechamos
    // nós mesmos quando o pagamento confirma ou o timer expira, "noopener" não impede isso porque
    // a referência é nossa (do lado que abriu), só bloqueia a popup de nos acessar de volta.
    private popupPagamento: Window | null = null;
    // Preenchido só quando o checkout falha por estoque indisponível E é compra de 1 produto só
    // (compraDireta ou carrinho com 1 item) -- mensagem específica (esgotado x em pagamento) em vez
    // do erro genérico, ver finalizar().
    itemIndisponivel = signal<{ produtoId: number; status: 'esgotado' | 'em_pagamento' } | null>(null);
    avisoEmail = signal('');
    avisoEnviando = signal(false);
    avisoEnviado = signal(false);
    verificandoPagamento = signal(false);
    pagamentoNaoConfirmado = signal(false);
    cotandoPreco = signal(false);

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
        private pedidosService: PedidosService,
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
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', this.onVisibilityChange);
        }

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
            // Não remove mais sozinho (ver CarrinhoService.validar no apollo-api) -- se tem item
            // indisponível, manda de volta pra sacola (já mostra linha vermelha + motivo lá, ver
            // CarrinhoPage) em vez de deixar seguir pro pagamento com a sacola desatualizada.
            if (this.autenticado && !this.compraDireta) {
                const { itensIndisponiveis } = await firstValueFrom(this.carrinhoDataSource.validar());
                if (itensIndisponiveis.length > 0) {
                    this.router.navigate(['/carrinho']);
                    return;
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

    formatarTempoRestante(segundos: number): string {
        const minutos = Math.floor(segundos / 60);
        const resto = segundos % 60;
        return `${minutos}:${resto.toString().padStart(2, '0')}`;
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
        return this.pendencias().length === 0 && !this.cotandoPreco();
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
        this.cotandoPreco.set(true);
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
        } finally {
            this.cotandoPreco.set(false);
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
        this.itemIndisponivel.set(null);
        this.avisoEnviado.set(false);

        // Popup em branco aberto SÍNCRONO aqui, antes de qualquer await -- Safari (principalmente
        // iOS) só concede permissão de fechar via popup.close() pra janela aberta em resposta
        // DIRETA a um gesto do usuário. window.open() chamado depois de um await (ex: só depois da
        // resposta do checkout) ainda abre a janela, mas o Safari passa a ignorar close() nela
        // silenciosamente -- por isso reservamos a popup aqui e só navegamos/fechamos ela depois
        // que soubermos qual gateway veio na resposta.
        const popupReservado = typeof window !== 'undefined'
            ? window.open('', 'pagamento', 'width=480,height=760')
            : null;

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

            // Pix (Mercado Pago): mostra QR Code + copia-e-cola direto nesta tela (sem abrir aba/
            // redirecionar) -- cliente paga usando o app do banco, a gente fica verificando a
            // confirmação em background até o timer (expiraReservaEm) zerar.
            if (resposta.cobranca?.qrCodePix || resposta.cobranca?.chavePixCopiaECola) {
                popupReservado?.close();
                this.resposta.set(resposta);
                this.iniciarTimerPagamento(resposta.expiraReservaEm);
                return;
            }

            // Outros gateways com checkout hospedado (ex: InfinityPay, cartão) -- reaproveita a
            // popup reservada no início do método (navega ela pra URL de pagamento em vez de abrir
            // uma nova), preservando a permissão de fechar concedida pelo Safari. Mesmo
            // timer/polling do Pix: expira -> fecha a popup e cancela; confirma -> fecha a popup e
            // navega pro pedido.
            if (resposta.cobranca?.urlDePagamento && typeof window !== 'undefined') {
                this.resposta.set(resposta);
                if (popupReservado) {
                    popupReservado.location.href = resposta.cobranca.urlDePagamento;
                    this.popupPagamento = popupReservado;
                } else {
                    // Popup bloqueada mesmo com o open síncrono (ex: usuário desabilitou popups) --
                    // tenta de novo como melhor esforço, mesmo sabendo que o close() pode não
                    // funcionar depois.
                    this.popupPagamento = window.open(resposta.cobranca.urlDePagamento, 'pagamento', 'width=480,height=760');
                }
                this.iniciarTimerPagamento(resposta.expiraReservaEm);
                return;
            }

            popupReservado?.close();
            this.router.navigate(['/pagamento'], { queryParams: { pedidoId: resposta.pedidoId } });
        } catch (error) {
            popupReservado?.close();
            console.error('Erro ao finalizar checkout', error);
            this.tratarErroFinalizar(error);
        } finally {
            this.finalizando.set(false);
        }
    }

    // itensIndisponiveis vem só na falha por estoque (ver EcommerceCheckoutService.
    // validarEstoqueVirtualDisponivel no apollo-api) -- compra de 1 produto só ganha mensagem
    // específica (esgotado x em pagamento, com opção de aviso por e-mail); carrinho com vários
    // itens cai no genérico (o carrinho já deveria ter marcado o item antes de chegar aqui).
    private tratarErroFinalizar(error: unknown): void {
        const corpo = (error as any)?.error;
        const itensIndisponiveis: { produtoId: number; status: 'esgotado' | 'em_pagamento' }[] | undefined = corpo?.itensIndisponiveis;

        if (itensIndisponiveis?.length && this.itens().length === 1) {
            this.itemIndisponivel.set(itensIndisponiveis[0]);
            if (this.autenticado) {
                const pessoa = this.localStorageService.get<UsuarioDto>('usuario_da_sessao') as UsuarioDto | null;
                this.avisoEmail.set(pessoa?.email ?? '');
            }
            this.erro.set(
                itensIndisponiveis[0].status === 'esgotado'
                    ? 'Poxa! Esse produto foi comprado por outra pessoa há pouco e não está mais disponível.'
                    : 'Alguém está comprando esse produto agora. Ele pode voltar ao estoque em alguns instantes, se o pagamento não for confirmado.',
            );
            return;
        }

        const mensagemApi = corpo?.message;
        this.erro.set(typeof mensagemApi === 'string' ? mensagemApi : 'Não foi possível finalizar seu pedido. Tente novamente.');
    }

    async avisarQuandoDisponivel(): Promise<void> {
        const item = this.itemIndisponivel();
        if (!item || !this.avisoEmail() || this.avisoEnviando()) {
            return;
        }

        this.avisoEnviando.set(true);
        try {
            await firstValueFrom(this.lojaDataSource.avisarDisponibilidade({ produtoId: item.produtoId, email: this.avisoEmail() }));
            this.avisoEnviado.set(true);
        } catch (error) {
            console.error('Erro ao pedir aviso de disponibilidade', error);
        } finally {
            this.avisoEnviando.set(false);
        }
    }

    async verificarPagamento(): Promise<void> {
        const resposta = this.resposta();
        if (!resposta || this.verificandoPagamento()) {
            return;
        }

        this.verificandoPagamento.set(true);
        this.pagamentoNaoConfirmado.set(false);
        try {
            const pedido = this.autenticado
                ? await this.pedidosService.buscar(resposta.pedidoId)
                : resposta.tokenAcesso
                    ? await this.pedidosService.buscarPublico(resposta.pedidoId, resposta.tokenAcesso)
                    : null;

            const pago = pedido?.pagamentos?.some((p) => !!p.confirmadoEm) ?? false;

            if (pago) {
                this.pararTimerPagamento();
                this.fecharPopupPagamento();
                this.router.navigate(['/pedidos', resposta.pedidoId], {
                    queryParams: resposta.tokenAcesso ? { token: resposta.tokenAcesso, pago: '1' } : { pago: '1' },
                });
                return;
            }

            this.pagamentoNaoConfirmado.set(true);
        } catch (error) {
            console.error('Erro ao verificar pagamento', error);
            this.pagamentoNaoConfirmado.set(true);
        } finally {
            this.verificandoPagamento.set(false);
        }
    }

    // 1 setInterval de 1s faz tudo: atualiza o mostrador de segundosRestantes, verifica o
    // pagamento a cada 5s (sem bater na API todo segundo) e, ao zerar, cancela o pedido e volta
    // pra sacola. expiraReservaEm vem de RESERVA_ESTOQUE_TTL_MINUTOS (configurável por e-commerce,
    // ver EcommerceCheckoutService.calcularExpiracaoReserva). expiraEmMs fica em campo (não closure
    // local) pra onVisibilityChange conseguir recalcular na hora que a aba volta a ficar visível.
    private iniciarTimerPagamento(expiraReservaEm?: string): void {
        this.pararTimerPagamento();
        if (!expiraReservaEm) {
            return;
        }

        this.expiraEmMs = new Date(expiraReservaEm).getTime();
        let ticks = 0;

        if (this.atualizarSegundosRestantes() <= 0) {
            this.expirarPagamento();
            return;
        }

        this.timerPagamento = setInterval(() => {
            const restante = this.atualizarSegundosRestantes();
            if (restante <= 0) {
                this.pararTimerPagamento();
                this.expirarPagamento();
                return;
            }
            ticks++;
            if (ticks % 5 === 0) {
                this.verificarPagamento();
            }
        }, 1000);
    }

    private atualizarSegundosRestantes(): number {
        if (this.expiraEmMs == null) {
            return 0;
        }
        const restante = Math.max(0, Math.round((this.expiraEmMs - Date.now()) / 1000));
        this.segundosRestantes.set(restante);
        return restante;
    }

    private pararTimerPagamento(): void {
        if (this.timerPagamento) {
            clearInterval(this.timerPagamento);
            this.timerPagamento = undefined;
        }
        this.expiraEmMs = undefined;
    }

    // Volta de outro app/aba em background: o setInterval do timer pode ter atrasado ou parado de
    // rodar de vez (iOS Safari suspende JS de aba em background pra economizar bateria) -- sem
    // isso, a popup do gateway podia ficar aberta minutos depois do timeout real, só fechando no
    // próximo tick (se é que ele roda). Recalcula na hora que a aba recupera o foco, e aproveita
    // pra já checar se o pagamento foi confirmado enquanto o usuário estava fora.
    private readonly onVisibilityChange = (): void => {
        if (typeof document === 'undefined' || document.visibilityState !== 'visible' || this.expiraEmMs == null) {
            return;
        }
        if (this.atualizarSegundosRestantes() <= 0) {
            this.pararTimerPagamento();
            this.expirarPagamento();
            return;
        }
        this.verificarPagamento();
    };

    private async expirarPagamento(): Promise<void> {
        if (this.expirandoPedido) {
            return;
        }
        this.expirandoPedido = true;
        this.fecharPopupPagamento();

        const resposta = this.resposta();
        if (resposta) {
            try {
                await firstValueFrom(this.checkoutDataSource.cancelarSeExpirado(resposta.pedidoId, resposta.tokenAcesso ?? ''));
            } catch (error) {
                console.error('Erro ao cancelar pedido expirado', error);
            }
        }

        this.router.navigate(['/carrinho']);
    }

    // `.closed` evita erro se o cliente já fechou a popup na mão antes do timer/confirmação.
    private fecharPopupPagamento(): void {
        if (this.popupPagamento && !this.popupPagamento.closed) {
            this.popupPagamento.close();
        }
        this.popupPagamento = null;
    }

    ngOnDestroy(): void {
        this.pararTimerPagamento();
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this.onVisibilityChange);
        }
    }
}
