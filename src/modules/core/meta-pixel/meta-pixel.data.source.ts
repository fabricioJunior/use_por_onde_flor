import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../http/remote.data.source.base";
import { environment } from "../../../environments/environment";

// Configuração PÚBLICA do Pixel: só o Pixel ID (id público por natureza). O token de acesso da Meta existe
// apenas no backend e nunca passa por aqui.
export interface MetaPixelConfigDto {
    habilitado: boolean;
    pixelId: string | null;
}

// Dados do Purchase de um pedido PAGO, vindos do backend (mesmo event_id, valor e itens do envio server-side).
export type MetaPurchaseDto =
    | { elegivel: false; motivo: string }
    | {
        elegivel: true;
        eventId: string;
        currency: string;
        value: number;
        content_ids: string[];
        content_type: 'product';
        contents: { id: string; quantity: number; item_price: number }[];
        num_items: number;
        order_id: string;
    };

@Injectable({ providedIn: 'root' })
export class MetaPixelDataSource extends RemoteDataSourceBase<any> {
    path = 'v1/e-commerce/{ecommerceId}/meta-pixel';

    constructor(http: HttpClient) {
        super(http);
    }

    private args() {
        return { ecommerceId: environment.ecommerceId.toString() };
    }

    config(): Observable<MetaPixelConfigDto> {
        return this.get({ pathArguments: this.args(), path: '/config' });
    }

    // produtoId -> content_id (retailer_id do catálogo Meta). A regra de fallback fica SÓ no backend.
    contentIds(produtoIds: number[]): Observable<{ ids: Record<string, string> }> {
        return this.post({ pathArguments: this.args(), path: '/content-ids', body: { produtoIds } });
    }

    purchase(pedidoId: number, token: string): Observable<MetaPurchaseDto> {
        return this.get({ pathArguments: this.args(), path: `/pedidos/${pedidoId}/purchase`, queryParameters: { token } });
    }
}
