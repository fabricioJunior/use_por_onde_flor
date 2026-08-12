export class PedidoItemDto {
    referenciaNome?: string;
    corNome?: string;
    tamanhoNome?: string;
    valorUnitario?: number;
    valorUnitDesconto?: number;
    solicitado?: number;
    atendido?: number;

    constructor(partial?: Partial<PedidoItemDto>) {
        Object.assign(this, partial);
    }
}

// Shape conforme já usado internamente pro pagamento do pedido -- confirmar campos extras
// quando o front puder bater no dev com dado real.
export class PedidoPagamentoDto {
    formaDePagamento?: string;
    valor?: number;
    situacao?: string;

    constructor(partial?: Partial<PedidoPagamentoDto>) {
        Object.assign(this, partial);
    }
}

export class PedidoDocumentoFiscalDto {
    id?: number;
    tipoDocumento?: string;
    status?: string;
    chaveAcesso?: string;
    protocolo?: string;
    linkDanfe?: string;

    constructor(partial?: Partial<PedidoDocumentoFiscalDto>) {
        Object.assign(this, partial);
    }
}

export class PedidoDetalheDto {
    id?: number;
    situacao?: string;
    data?: string;
    modalidadeEntrega?: string;
    enderecoEntregaId?: number;
    desconto?: number;
    valorTotal?: number;
    previsaoDeEntrega?: string;
    itens?: PedidoItemDto[];
    pagamentos?: PedidoPagamentoDto[];
    documentoFiscal?: PedidoDocumentoFiscalDto;

    constructor(partial?: Partial<PedidoDetalheDto>) {
        Object.assign(this, partial);
    }
}
