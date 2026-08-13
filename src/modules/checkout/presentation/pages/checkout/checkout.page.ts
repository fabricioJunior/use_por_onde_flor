import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";
import { cpf } from "cpf-cnpj-validator";
import { firstValueFrom } from "rxjs";
import { CarrinhoFacadeService } from "../../../../carrinho/services/carrinho.facade.service";
import { CarrinhoItemViewDto } from "../../../../carrinho/data/dtos/carrinho-item-view.dto";
import { AutenticacaoService } from "../../../../autenticacao/services/autenticacao.service";
import { LocalStorageService } from "../../../../core/local_storage/local-storage.service";
import { UsuarioDto } from "../../../../autenticacao/data/dto/usuario.dto";
import { LojaDataSource } from "../../../../loja/data/loja.data.source";
import { CheckoutDataSource } from "../../../data/checkout.data.source";
import { EnderecoDataSource } from "../../../data/endereco.data.source";
import { EnderecoDto } from "../../../data/dtos/endereco.dto";
import { CheckoutCobrancaDto, ModalidadeEntregaPedido } from "../../../data/dtos/checkout.dto";
import { ButtonComponent } from "../../../../loja/presentation/components/ui/button/button.component";

function cpfValidator(control: { value: string }) {
    if (!control.value) {
        return null;
    }
    return cpf.isValid(control.value) ? null : { cpfInvalido: true };
}

@Component({
    selector: 'checkout-page',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule, NgxMaskDirective, MatProgressSpinnerModule, ClipboardModule, ButtonComponent],
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
    enderecos = signal<EnderecoDto[]>([]);
    enderecoSelecionadoId = signal<number | null>(null);
    mostrarNovoEndereco = signal(false);
    resposta = signal<{ pedidoId: number; cobranca?: CheckoutCobrancaDto } | null>(null);

    autenticado: boolean;

    total = computed(() => this.itens().reduce((soma, item) => soma + (item.valor ?? 0) * (item.quantidade ?? 0), 0));

    clienteForm: ReturnType<FormBuilder['group']>;
    enderecoForm: ReturnType<FormBuilder['group']>;

    modalidadeEntrega = signal<ModalidadeEntregaPedido>('retirada');

    constructor(
        private formBuilder: FormBuilder,
        private carrinhoFacadeService: CarrinhoFacadeService,
        private autenticacaoService: AutenticacaoService,
        private localStorageService: LocalStorageService,
        private lojaDataSource: LojaDataSource,
        private checkoutDataSource: CheckoutDataSource,
        private enderecoDataSource: EnderecoDataSource,
        public router: Router,
    ) {
        this.autenticado = this.autenticacaoService.estaAutenticado();

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
    }

    async ngOnInit(): Promise<void> {
        this.loading.set(true);
        try {
            // Chamadas separadas: falha em status() (ex: loja sem caixa configurado) não pode
            // esconder os itens da sacola, que vêm de uma fonte totalmente independente.
            const itens = await this.carrinhoFacadeService.listar();
            this.itens.set(itens);

            try {
                const status = await firstValueFrom(this.lojaDataSource.status());
                this.lojaFechada.set(!status.aberto);
            } catch (statusError) {
                console.error('Erro ao consultar status da loja', statusError);
                this.lojaFechada.set(false);
            }

            if (this.autenticado) {
                const pessoa = this.localStorageService.get<UsuarioDto>('usuario_da_sessao') as UsuarioDto | null;
                if (pessoa?.id) {
                    const enderecos = await firstValueFrom(this.enderecoDataSource.listar(pessoa.id));
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

    selecionarModalidade(modalidade: ModalidadeEntregaPedido): void {
        this.modalidadeEntrega.set(modalidade);
    }

    formatarPreco(valor: number | undefined): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    podeFinalizar(): boolean {
        if (this.itens().length === 0 || this.lojaFechada()) {
            return false;
        }
        if (!this.autenticado && this.clienteForm.invalid) {
            return false;
        }
        if (this.modalidadeEntrega() === 'entrega') {
            if (!this.autenticado) {
                return false;
            }
            if (this.mostrarNovoEndereco()) {
                return this.enderecoForm.valid;
            }
            return this.enderecoSelecionadoId() != null;
        }
        return true;
    }

    async finalizar(): Promise<void> {
        if (!this.podeFinalizar() || this.finalizando()) {
            return;
        }

        this.finalizando.set(true);
        this.erro.set('');

        try {
            let enderecoEntregaId: number | undefined;

            if (this.modalidadeEntrega() === 'entrega') {
                if (this.mostrarNovoEndereco()) {
                    const pessoa = this.localStorageService.get<UsuarioDto>('usuario_da_sessao') as UsuarioDto | null;
                    const valores = this.enderecoForm.getRawValue();
                    const novoEndereco = await firstValueFrom(this.enderecoDataSource.criar(pessoa!.id!, {
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

            const resposta = await firstValueFrom(this.checkoutDataSource.finalizar({
                itens: this.autenticado ? undefined : this.itens().map((item) => ({ produtoId: item.produtoId!, quantidade: item.quantidade! })),
                cliente: this.autenticado ? undefined : this.clienteForm.getRawValue() as any,
                modalidadeEntrega: this.modalidadeEntrega(),
                enderecoEntregaId,
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
            this.erro.set('Não foi possível finalizar seu pedido. Tente novamente.');
        } finally {
            this.finalizando.set(false);
        }
    }

    irParaConfirmacao(): void {
        const pedidoId = this.resposta()?.pedidoId;
        this.router.navigate(['/pagamento'], { queryParams: { pedidoId } });
    }
}
