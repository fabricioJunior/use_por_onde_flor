export class PedidoItemDto {
    referenciaNome?: string;
    imagemUrl?: string;
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

// Shape real de PedidoPagamentoResponse (apollo-api) -- formaDePagamento vem como o objeto inteiro
// (FormaDePagamentoEntity, eager relation), não uma string; valor confirmado só existe depois da
// confirmação do pagamento, até lá é só o esperado.
export class PedidoPagamentoDto {
    formaDePagamento?: { id?: number; descricao?: string };
    valorEsperado?: number;
    valorConfirmado?: number;
    confirmadoEm?: string;

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
    urlConsultaSefaz?: string;

    constructor(partial?: Partial<PedidoDocumentoFiscalDto>) {
        Object.assign(this, partial);
    }
}

export class PedidoDetalheDto {
    id?: number;
    situacao?: string;
    criadoEm?: string;
    atualizadoEm?: string;
    modalidadeEntrega?: string;
    enderecoEntregaId?: number;
    desconto?: number;
    valorTotal?: number;
    previsaoDeEntrega?: string;
    situacaoEntrega?: string;
    retiradoEm?: string;
    itens?: PedidoItemDto[];
    pagamentos?: PedidoPagamentoDto[];
    documentoFiscal?: PedidoDocumentoFiscalDto;

    constructor(partial?: Partial<PedidoDetalheDto>) {
        Object.assign(this, partial);
    }
}
