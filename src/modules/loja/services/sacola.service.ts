import { Injectable, computed, signal } from "@angular/core";
import { CarrinhoFacadeService } from "../../carrinho/services/carrinho.facade.service";
import { CarrinhoItemViewDto } from "../../carrinho/data/dtos/carrinho-item-view.dto";

// Estado do drawer da sacola, compartilhado entre header, card de produto e página de produto.
// NÃO é um carrinho novo: toda leitura/escrita passa pelo `CarrinhoFacadeService` existente (API
// quando a pessoa está logada, storage local quando é convidado).
@Injectable({ providedIn: 'root' })
export class SacolaService {
    readonly aberta = signal(false);
    readonly itens = signal<CarrinhoItemViewDto[]>([]);
    readonly carregando = signal(false);

    readonly contagem = computed(() => this.itens().reduce((total, i) => total + (i.quantidade ?? 0), 0));
    readonly subtotal = computed(() =>
        this.itens().reduce((total, i) => total + (i.valorPromocional ?? i.valor ?? 0) * (i.quantidade ?? 0), 0),
    );

    constructor(private carrinho: CarrinhoFacadeService) { }

    async recarregar(): Promise<void> {
        this.carregando.set(true);
        try {
            this.itens.set(await this.carrinho.listar());
        } catch (error) {
            // Sacola é chrome de todas as telas -- falha de rede não pode derrubar a página.
            console.error('Erro ao carregar a sacola', error);
        } finally {
            this.carregando.set(false);
        }
    }

    abrir(): void {
        this.aberta.set(true);
        void this.recarregar();
    }

    fechar(): void {
        this.aberta.set(false);
    }

    async adicionar(produtoId: number, quantidade: number): Promise<void> {
        await this.carrinho.adicionar(produtoId, quantidade);
        await this.recarregar();
        this.aberta.set(true);
    }

    // `CarrinhoFacadeService.adicionar` é upsert (define a quantidade, não soma) -- chegar a 0
    // remove o item, igual ao seletor da sacola no mock.
    async definirQuantidade(item: CarrinhoItemViewDto, quantidade: number): Promise<void> {
        if (item.produtoId == null) {
            return;
        }
        if (quantidade < 1) {
            await this.remover(item);
            return;
        }
        const limite = item.quantidadeDisponivel ?? item.saldo ?? quantidade;
        await this.carrinho.adicionar(item.produtoId, Math.min(quantidade, limite));
        await this.recarregar();
    }

    async remover(item: CarrinhoItemViewDto): Promise<void> {
        if (item.produtoId == null) {
            return;
        }
        await this.carrinho.remover(item.produtoId);
        await this.recarregar();
    }
}
