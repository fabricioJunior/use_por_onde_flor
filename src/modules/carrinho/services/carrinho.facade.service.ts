import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { AutenticacaoService } from "../../autenticacao/services/autenticacao.service";
import { CarrinhoDataSource } from "../data/carrinho.data.source";
import { CarrinhoStorageService } from "../data/carrinho.storage.service";
import { CarrinhoItemViewDto } from "../data/dtos/carrinho-item-view.dto";

// Decide entre carrinho da API (pessoa logada) e carrinho local (convidado). Ao detectar que a
// pessoa logou com itens locais pendentes, sincroniza (upsert na API) e limpa o storage local --
// checagem feita de forma "lazy" no início de `listar()`/`adicionar()`.
@Injectable({ providedIn: 'root' })
export class CarrinhoFacadeService {
    constructor(
        private carrinhoDataSource: CarrinhoDataSource,
        private carrinhoStorageService: CarrinhoStorageService,
        private autenticacaoService: AutenticacaoService,
    ) { }

    private logado(): boolean {
        return this.autenticacaoService.estaAutenticado();
    }

    async listar(): Promise<CarrinhoItemViewDto[]> {
        await this.sincronizarSeNecessario();
        if (this.logado()) {
            return firstValueFrom(this.carrinhoDataSource.listar());
        }
        return this.carrinhoStorageService.recuperarItens();
    }

    async adicionar(produtoId: number, quantidade: number): Promise<void> {
        await this.sincronizarSeNecessario();
        if (this.logado()) {
            await firstValueFrom(this.carrinhoDataSource.upsertItem({ produtoId, quantidade }));
            return;
        }
        await this.carrinhoStorageService.adicionarOuAtualizarItem({ produtoId, quantidade });
    }

    async remover(produtoId: number): Promise<void> {
        if (this.logado()) {
            await firstValueFrom(this.carrinhoDataSource.removerItem(produtoId));
            return;
        }
        await this.carrinhoStorageService.removerItem(produtoId);
    }

    async contarItens(): Promise<number> {
        const itens = await this.listar();
        return itens.reduce((total, item) => total + (item.quantidade ?? 0), 0);
    }

    limparLocal(): void {
        this.carrinhoStorageService.limpar();
    }

    private async sincronizarSeNecessario(): Promise<void> {
        if (!this.logado()) {
            return;
        }

        const itensLocais = await this.carrinhoStorageService.recuperarItens();
        if (itensLocais.length === 0) {
            return;
        }

        for (const item of itensLocais) {
            if (item.produtoId != null && item.quantidade != null) {
                await firstValueFrom(this.carrinhoDataSource.upsertItem({ produtoId: item.produtoId, quantidade: item.quantidade }));
            }
        }

        this.carrinhoStorageService.limpar();
    }
}
