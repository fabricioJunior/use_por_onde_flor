// Shape de GET /e-commerce/{id}/promocoes (apollo-api, PromocaoEntity já populada com o escopo).
// Só os campos usados pro cálculo de preço no catálogo -- ver PromocaoPrecoService.
export type PromocaoTipoDesconto = 'percentual' | 'valor_fixo' | 'preco_fixo';
export type PromocaoTipoEscopo = 'geral' | 'referencias' | 'combo_kit' | 'combo_leve_pague';

export interface PromocaoDto {
    id: number;
    tipoDesconto: PromocaoTipoDesconto;
    tipoEscopo: PromocaoTipoEscopo;
    valorPercentual?: number;
    valorDescontoMaximo?: number;
    valorFixo?: number;
    precoFixo?: number;
    referenciaIds?: number[];
    regras?: string;
}
