// Shape de apollo-api ListaPersonalizadaPublicaResponse (GET /v1/listas-personalizadas/publico/:hash).
export interface ListaPersonalizadaItemDto {
    referenciaId?: number;
    nome?: string;
    valor?: number;
    imagemUrl?: string;
}

export interface ListaPersonalizadaPublicaDto {
    dataExpiracao: string;
    titulo: string | null;
    itens: ListaPersonalizadaItemDto[];
}
