import { Inject, Injectable } from "@angular/core";
import { ProdutoDataSource } from "../data/produto.data.source";
import { ProdutoDto } from "../data/dtos/produto.dto";


@Injectable()
export class ProdutoService {

    constructor(private produtoDataSource: ProdutoDataSource) {

    }
    async recuperarProdutos(descricao: string, tamanhos: string[], cores: string[]): Promise<ProdutoDto[]> {
        return this.produtoDataSource.getProdutosComFiltro({
            descricao: descricao,
            cores: cores,
            tamanhos: tamanhos
        });
    }

    async recuperarCores(): Promise<string[]> {
        return this.produtoDataSource.getCores();
    }
    async recuperarTamanhos(): Promise<string[]> {
        return this.produtoDataSource.getTamanhos();
    }

    async recuperarCruzamentoTamanhoCor(referencia: string): Promise<CruzamentoTamanhoCorView> {

        const produtos = await this.produtoDataSource.getProdutosComFiltro({
            referencia: referencia,
            estoqueMaiorQueZero: false,
        });

        const tamanhos = Array.from(new Set(produtos.map(produto => produto.tamanho ?? ''))).sort();

        const cores = Array.from(new Set(produtos.map(produto => produto.cor ?? ''))).sort();

        const corTamanhoParaQuantidade: Record<string, string> = {};

        for (const cor of cores) {
            for (const tamanho of tamanhos) {
                const produto = produtos.find(
                    produto => produto.cor === cor && produto.tamanho === tamanho
                );
                corTamanhoParaQuantidade[`${cor}_${tamanho}`] =
                    produto?.quantidade == null ? '*' : produto.quantidade.toString();
            }
        }

        corTamanhoParaQuantidade['']
        return new CruzamentoTamanhoCorView({
            tamanhos: tamanhos,
            cores: cores,
            descricao: produtos[0]?.descricao ?? '',
            corTamanhoParaQuantidade: corTamanhoParaQuantidade
        });
    }
}

export class CruzamentoTamanhoCorView {

    tamanhos: string[] = [];
    cores: string[] = [];
    descricao: string = '';
    corTamanhoParaQuantidade?: Record<string, string>;

    constructor(partial?: Partial<CruzamentoTamanhoCorView>) {
        Object.assign(this, partial);
    }
}