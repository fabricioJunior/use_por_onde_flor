export interface CotarCheckoutRequestDto {
    itens: { produtoId: number; quantidade: number }[];
    formaDePagamentoId?: number;
}

export interface CotarCheckoutItemDto {
    produtoId: number;
    valor: number;
    valorPromocional: number;
}

export interface CotarCheckoutResponseDto {
    itens: CotarCheckoutItemDto[];
    total: number;
}
