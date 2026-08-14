import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { AutenticacaoService } from "../../autenticacao/services/autenticacao.service";
import { LojaDataSource } from "../../loja/data/loja.data.source";
import { PromocaoPrecoService } from "../../loja/services/promocao-preco.service";
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
        private lojaDataSource: LojaDataSource,
        private promocaoPrecoService: PromocaoPrecoService,
    ) { }

    private logado(): boolean {
        return this.autenticacaoService.estaAutenticado();
    }

    async listar(): Promise<CarrinhoItemViewDto[]> {
        await this.sincronizarSeNecessario();
        const itens = this.logado()
            ? await firstValueFrom(this.carrinhoDataSource.listar())
            : await this.enriquecerItensLocais(await this.carrinhoStorageService.recuperarItens());
        return this.aplicarPrecosPromocionais(itens);
    }

    // Carrinho não tem endpoint de preço-com-desconto pronto -- mesmo cálculo client-side já usado
    // no catálogo (ver PromocaoPrecoService), agora com referenciaId vindo do item (backend
    // enriquece em GET /carrinho e GET /e-commerce/{id}/produtos/{produtoId}).
    private async aplicarPrecosPromocionais(itens: CarrinhoItemViewDto[]): Promise<CarrinhoItemViewDto[]> {
        if (itens.length === 0) {
            return itens;
        }
        try {
            const resposta = await firstValueFrom(this.lojaDataSource.promocoesAtivas());
            const mapa = this.promocaoPrecoService.montarMapa(resposta.items);
            const gerais = this.promocaoPrecoService.promocoesGerais(resposta.items);
            return itens.map((item) => ({
                ...item,
                valorPromocional: (item.referenciaId != null && item.valor != null
                    ? this.promocaoPrecoService.calcularParaReferencia(item.referenciaId, item.valor, mapa, gerais)
                    : null) ?? undefined,
            }));
        } catch (error) {
            // Falha ao buscar promoção não pode derrubar o carrinho -- só segue sem desconto.
            console.error('Erro ao aplicar promoções no carrinho', error);
            return itens;
        }
    }

    // Storage local só tem produtoId+quantidade -- busca nome/cor/tamanho/valor/imagem em paralelo
    // via endpoint público. Item que falhar no lookup (produto excluído, etc.) some da view em vez
    // de quebrar a sacola inteira.
    private async enriquecerItensLocais(itens: { produtoId?: number; quantidade?: number }[]): Promise<CarrinhoItemViewDto[]> {
        const enriquecidos = await Promise.all(
            itens.map(async (item) => {
                if (item.produtoId == null) {
                    return null;
                }
                try {
                    const detalhe = await firstValueFrom(this.lojaDataSource.produto(item.produtoId));
                    return { ...detalhe, quantidade: item.quantidade } as CarrinhoItemViewDto;
                } catch {
                    return null;
                }
            }),
        );
        return enriquecidos.filter((item): item is CarrinhoItemViewDto => item !== null);
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
                try {
                    await firstValueFrom(this.carrinhoDataSource.upsertItem({ produtoId: item.produtoId, quantidade: item.quantidade }));
                } catch (error) {
                    // Item do carrinho local pode ter ficado inválido (produto sem saldo, excluído, etc.)
                    // -- um item ruim não pode travar a sincronização inteira (nem, por tabela, o
                    // carregamento da página que chamou listar()/contarItens() logo em seguida).
                    console.error('Falha ao sincronizar item do carrinho local', item, error);
                }
            }
        }

        this.carrinhoStorageService.limpar();
    }
}
