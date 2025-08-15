import { Inject, Injectable } from "@angular/core";
import { ProdutoDataSource } from "../data/produto.data.source";
import { ProdutoDto } from "../data/dtos/produto.dto";


@Injectable()
export class ProdutoService {

    constructor(private produtoDataSource: ProdutoDataSource) {

    }
    async recuperarProdutos(descrica: string, tamanhos: string[], cores: string[]): Promise<ProdutoDto[]> {
        return this.produtoDataSource.getProdutosComFiltro(descrica, cores, tamanhos);
    }

    async recuperarCores(): Promise<string[]> {
        return this.produtoDataSource.getCores();
    }
    async recuperarTamanhos(): Promise<string[]> {
        return this.produtoDataSource.getTamanhos();
    }
}