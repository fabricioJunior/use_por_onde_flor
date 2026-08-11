// Espelha CheckoutEcommerceDto / CheckoutEcommerceResponse do apollo-api
// (apps/api/src/modules/ecommerce/ecommerce-checkout/dto/*.ts).
export type ModalidadeEntregaPedido = 'retirada' | 'entrega';

export interface CheckoutItemDto {
    produtoId: number;
    quantidade: number;
}

export interface CheckoutClienteDto {
    nome: string;
    documento: string;
    email: string;
    telefone: string;
}

export interface CheckoutRequestDto {
    itens?: CheckoutItemDto[];
    cliente?: CheckoutClienteDto;
    modalidadeEntrega: ModalidadeEntregaPedido;
    enderecoEntregaId?: number;
}

export interface CheckoutCobrancaDto {
    qrCodePix?: string;
    chavePixCopiaECola?: string;
    urlDePagamento?: string;
}

export interface CheckoutResponseDto {
    pedidoId: number;
    cobranca?: CheckoutCobrancaDto;
}
