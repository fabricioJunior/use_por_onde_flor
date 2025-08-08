export class PagamentoPendenteDto {


    idPedido?: string;
    notaFiscal?: string;
    pendente?: boolean;

    constructor(partial?: Partial<PagamentoPendenteDto>) {
        Object.assign(this, partial);
    }
}