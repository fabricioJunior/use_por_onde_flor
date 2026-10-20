export interface CotarCheckoutRequestDto {
    itens: { produtoId: number; quantidade: number }[];
    formaDePagamentoId?: number;
    codigosCupom?: string[];
}

export interface CotarCheckoutItemDto {
    produtoId: number;
    valor: number;
    valorPromocional: number;
}

export interface CotarCheckoutResponseDto {
    itens: CotarCheckoutItemDto[];
    total: number;
    cupons?: { codigo: string; aplicado: boolean; motivo?: string; desconto?: number }[];
}
