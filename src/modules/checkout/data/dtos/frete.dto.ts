// Espelha OpcaoFrete do apollo-api (frete-integracao/contracts/frete-provider.interface.ts).
export interface OpcaoFreteDto {
    provider: string;
    serviceId: string;
    service: string;
    carrier: string;
    price: number;
    customPrice?: number;
    deliveryTime: number;
    customDeliveryTime?: number;
}

export interface CotarFreteItemDto {
    produtoId: number;
    quantidade: number;
}

export interface CotarFreteRequestDto {
    itens: CotarFreteItemDto[];
    cepDestino: string;
}
