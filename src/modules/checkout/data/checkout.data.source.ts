import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { environment } from "../../../environments/environment";
import { CheckoutRequestDto, CheckoutResponseDto } from "./dtos/checkout.dto";

@Injectable({ providedIn: 'root' })
export class CheckoutDataSource extends RemoteDataSourceBase<CheckoutResponseDto> {
    path = 'e-commerce/{ecommerceId}/checkout';

    constructor(http: HttpClient) {
        super(http);
    }

    finalizar(dto: CheckoutRequestDto): Observable<CheckoutResponseDto> {
        return this.post({
            pathArguments: { ecommerceId: environment.ecommerceId.toString() },
            body: dto,
        });
    }
}
