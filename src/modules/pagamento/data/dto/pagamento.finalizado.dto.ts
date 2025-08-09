export class PagamentoFinalizadoDto {

    comprovanteDePagamento?: string;
    transanctionId?: string;
    formaDePagamento?: string;
    idPedido?: string;
    slug?: string;


    constructor(partial?: Partial<PagamentoFinalizadoDto>) {
        Object.assign(this, partial);
    }
}