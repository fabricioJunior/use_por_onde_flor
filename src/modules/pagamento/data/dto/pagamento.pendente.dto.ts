export class PagamentoPendenteDto {


    idPedido?: string;
    notaFiscal?: string;
    pendente?: boolean;
    comprovante?: string;


    constructor(partial?: Partial<PagamentoPendenteDto>) {
        Object.assign(this, partial);
    }
}