// Espelha CheckoutEcommerceDto / CheckoutEcommerceResponse do apollo-api
// (apps/api/src/modules/ecommerce/ecommerce-checkout/dto/*.ts).
import { OpcaoFreteDto } from "./frete.dto";

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

// Espelha CreatePessoaEnderecoDto do apollo-api -- usado só quando guest escolhe "entrega" (sem
// pessoa/endereço salvo ainda, ver EcommerceCheckoutService.checkout).
export interface CheckoutEnderecoInlineDto {
    principal: boolean;
    tipoEndereco: 'Residencial' | 'Comercial';
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
}

export interface CheckoutRequestDto {
    itens?: CheckoutItemDto[];
    cliente?: CheckoutClienteDto;
    modalidadeEntrega: ModalidadeEntregaPedido;
    enderecoEntregaId?: number;
    enderecoEntrega?: CheckoutEnderecoInlineDto;
    freteEscolhido?: OpcaoFreteDto;
    formaDePagamentoId?: number;
}

export interface CheckoutCobrancaDto {
    qrCodePix?: string;
    chavePixCopiaECola?: string;
    urlDePagamento?: string;
}

export interface CheckoutResponseDto {
    pedidoId: number;
    cobranca?: CheckoutCobrancaDto;
    // Presente só pra checkout guest -- permite consultar o status do pedido sem login
    // (GET /pedidos/publico/:id?token=).
    tokenAcesso?: string;
}
