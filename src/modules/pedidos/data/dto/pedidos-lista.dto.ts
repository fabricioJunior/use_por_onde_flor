export class PedidoListaItemDto {
    id?: number;
    situacao?: string;
    data?: string;
    valorTotal?: number;
    imagemCapa?: string;

    constructor(partial?: Partial<PedidoListaItemDto>) {
        Object.assign(this, partial);
    }
}

export class PedidosListaDto {
    items?: PedidoListaItemDto[];
    pagina?: number;
    itensPorPagina?: number;
    temMais?: boolean;

    constructor(partial?: Partial<PedidosListaDto>) {
        Object.assign(this, partial);
    }
}
