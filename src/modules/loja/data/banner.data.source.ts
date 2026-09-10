import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { BannerDto } from "./dtos/banner.dto";

@Injectable({ providedIn: 'root' })
export class BannerDataSource extends RemoteDataSourceBase<any> {
    path = 'v1/e-commerce/{ecommerceId}/banners';

    constructor(http: HttpClient) {
        super(http);
    }

    listar(): Observable<BannerDto[]> {
        return this.getList({ pathArguments: { ecommerceId: String(environment.ecommerceId) } });
    }
}
