export class PontoDto {
    criadoEm?: Date;
    atualizadoEm?: Date;
    id?: number;
    tipo?: string;
    quantidade?: number;
    cancelado?: boolean;

    constructor(partial?: Partial<PontoDto>) {
        Object.assign(this, partial);
    }
}