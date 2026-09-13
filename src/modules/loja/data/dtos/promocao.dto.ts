// Shape de GET /e-commerce/{id}/promocoes (apollo-api, PromocaoEntity já populada com o escopo).
// Só os campos usados pro cálculo de preço no catálogo -- ver PromocaoPrecoService.
export type PromocaoTipoDesconto = 'percentual' | 'valor_fixo' | 'preco_fixo';
// faixa_quantidade não entra no cálculo de preço unitário do catálogo -- mesmo motivo de
// combo_kit/combo_leve_pague (ver PromocaoPrecoService.montarMapa): o desconto depende de QUANTOS
// itens o cliente vai levar, que catálogo/card de produto não sabe de antemão (mostraria um
// desconto que só vale a partir de N unidades como se fosse o preço de 1 unidade).
export type PromocaoTipoEscopo = 'geral' | 'referencias' | 'combo_kit' | 'combo_leve_pague' | 'faixa_quantidade';

export interface PromocaoFormaPagamentoDto {
    formaDePagamentoId: number;
    valorPercentual?: number;
    valorFixo?: number;
    precoFixo?: number;
}

export interface PromocaoFaixaDto {
    quantidadeMinima: number;
    valorDesconto: number;
}

export interface PromocaoDto {
    id: number;
    tipoDesconto: PromocaoTipoDesconto;
    tipoEscopo: PromocaoTipoEscopo;
    valorPercentual?: number;
    valorDescontoMaximo?: number;
    valorFixo?: number;
    precoFixo?: number;
    referenciaIds?: number[];
    // Presente quando tipoEscopo=faixa_quantidade. Usado só no carrinho (ver
    // PromocaoPrecoService.calcularFaixaParaCarrinho) -- carrinho conhece a quantidade por
    // referenciaId, catálogo não (ver comentário de PromocaoTipoEscopo acima).
    faixas?: PromocaoFaixaDto[];
    regras?: string;
    restringirFormasPagamento?: boolean;
    formasPagamento?: PromocaoFormaPagamentoDto[];
}
