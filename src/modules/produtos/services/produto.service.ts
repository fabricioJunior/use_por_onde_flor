import { Inject, Injectable } from "@angular/core";
import { ProdutoDataSource } from "../data/produto.data.source";
import { ProdutoDto } from "../data/dtos/produto.dto";


@Injectable()
export class ProdutoService {

    constructor(private produtoDataSource: ProdutoDataSource) {

    }
    async recuperarProdutos(descrica: string): Promise<ProdutoDto[]> {
        return this.produtoDataSource.getProdutosComFiltro(descrica);
    }
}