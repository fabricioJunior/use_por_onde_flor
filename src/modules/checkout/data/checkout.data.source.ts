import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { environment } from "../../../environments/environment";
import { CheckoutRequestDto, CheckoutResponseDto } from "./dtos/checkout.dto";
import { CotarFreteRequestDto, OpcaoFreteDto } from "./dtos/frete.dto";

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
}
