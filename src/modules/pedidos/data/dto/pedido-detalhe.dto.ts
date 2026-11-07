export class PedidoItemDto {
    referenciaNome?: string;
    imagemUrl?: string;
    corNome?: string;
    tamanhoNome?: string;
    // Opcional, mesma ressalva de EcommerceReferenciaProdutoDto.estampaNome -- backend ainda não
    // preenche em pedido-item-enrich.util.ts.
    estampaNome?: string;
    valorUnitario?: number;
    valorUnitDesconto?: number;
    solicitado?: number;
    atendido?: number;

    constructor(partial?: Partial<PedidoItemDto>) {
        Object.assign(this, partial);
    }
}

export class PedidoPagamentoCobrancaDto {
    qrCodePix?: string;
    chavePixCopiaECola?: string;
    urlDePagamento?: string;

    constructor(partial?: Partial<PedidoPagamentoCobrancaDto>) {
        Object.assign(this, partial);
    }
}

// Shape real de PedidoPagamentoResponse (apollo-api) -- formaDePagamento vem como o objeto inteiro
// (FormaDePagamentoEntity, eager relation), não uma string; valor confirmado só existe depois da
// confirmação do pagamento, até lá é só o esperado. cobranca só vem preenchida quando o pagamento
// é online e ainda está pendente (PedidoPagamentoService.findByPedidoId reconstrói o link do
// gateway a cada consulta) -- é o link que permite retomar o pagamento se o cliente saiu do fluxo.
export class PedidoPagamentoDto {
    formaDePagamento?: { id?: number; descricao?: string };
    valorEsperado?: number;
    valorConfirmado?: number;
    confirmadoEm?: string;
    cobranca?: PedidoPagamentoCobrancaDto;
    estoqueDisponivel?: boolean;

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

// Formas de pagamento online que o cliente pode escolher no link do pedido (GET v1/pedidos/publico/:id/opcoes-pagamento).
export class OpcaoPagamentoPublicoDto {
    formaDePagamentoId!: number;
    descricao!: string;
    parcelas!: number;
    valor!: number;
    desconto!: number;
    definidaPeloVendedor!: boolean;
}

export class OpcoesPagamentoPublicoDto {
    pedidoId!: number;
    totalSemDescontos!: number;
    formas!: OpcaoPagamentoPublicoDto[];
}

// Resposta de POST v1/pedidos/publico/:id/pagamento: só o que o site usa para levar o cliente ao gateway.
export class PagamentoEscolhidoDto {
    cobranca?: { urlDePagamento?: string; qrCodePix?: string; chavePixCopiaECola?: string };
}
