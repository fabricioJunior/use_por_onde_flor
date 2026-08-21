import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { environment } from "../../../environments/environment";
import { CheckoutRequestDto, CheckoutResponseDto } from "./dtos/checkout.dto";
import { CotarFreteRequestDto, OpcaoFreteDto } from "./dtos/frete.dto";
import { CotarCheckoutRequestDto, CotarCheckoutResponseDto } from "./dtos/cotar-checkout.dto";

@Injectable({ providedIn: 'root' })
export class CheckoutDataSource extends RemoteDataSourceBase<CheckoutResponseDto> {
    path = 'v1/e-commerce/{ecommerceId}/checkout';

    constructor(http: HttpClient) {
        super(http);
    }

    finalizar(dto: CheckoutRequestDto): Observable<CheckoutResponseDto> {
        return this.post({
            pathArguments: { ecommerceId: environment.ecommerceId.toString() },
            body: dto,
        });
    }

    cotarFrete(dto: CotarFreteRequestDto): Observable<OpcaoFreteDto[]> {
        return this.post({
            pathArguments: { ecommerceId: environment.ecommerceId.toString() },
            path: '/frete',
            body: dto,
        }) as unknown as Observable<OpcaoFreteDto[]>;
    }

    cotar(dto: CotarCheckoutRequestDto): Observable<CotarCheckoutResponseDto> {
        return this.post({
            pathArguments: { ecommerceId: environment.ecommerceId.toString() },
            path: '/cotar',
            body: dto,
        }) as unknown as Observable<CotarCheckoutResponseDto>;
    }

    // Chamado quando o timer da tela de pagamento (Pix) zera -- idempotente, sem efeito se o
    // pedido já não estiver mais aguardando pagamento (pago/faturado/cancelado por outro motivo).
    cancelarSeExpirado(pedidoId: number, token: string): Observable<void> {
        return this.post({
            pathArguments: { ecommerceId: environment.ecommerceId.toString() },
            path: `/${pedidoId}/cancelar-expirado`,
            queryParameters: { token },
        }) as unknown as Observable<void>;
    }

    // Pré-checagem de disponibilidade (sem side-effect) -- usado pelo carrinho antes de finalizar,
    // pra marcar item esgotado/em pagamento sem precisar tentar o checkout de verdade.
    verificarDisponibilidade(itens: { produtoId: number; quantidade: number }[]): Observable<{
        produtoId: number;
        quantidadeSolicitada: number;
        quantidadeDisponivel: number;
        status: 'disponivel' | 'esgotado' | 'em_pagamento';
    }[]> {
        return this.post({
            pathArguments: { ecommerceId: environment.ecommerceId.toString() },
            path: '/disponibilidade',
            body: { itens },
        }) as unknown as Observable<
            { produtoId: number; quantidadeSolicitada: number; quantidadeDisponivel: number; status: 'disponivel' | 'esgotado' | 'em_pagamento' }[]
        >;
    }
}
