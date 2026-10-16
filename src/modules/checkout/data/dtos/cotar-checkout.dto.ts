export interface CotarCheckoutRequestDto {
    itens: { produtoId: number; quantidade: number }[];
    formaDePagamentoId?: number;
    codigoCupom?: string;
}

export interface CotarCheckoutItemDto {
    produtoId: number;
    valor: number;
    valorPromocional: number;
}

export interface CotarCheckoutResponseDto {
    itens: CotarCheckoutItemDto[];
    total: number;
    cupom?: { codigo: string; aplicado: boolean; motivo?: string };
}
