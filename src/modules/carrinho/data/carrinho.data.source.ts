import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { environment } from "../../../environments/environment";
import { CarrinhoItemViewDto } from "./dtos/carrinho-item-view.dto";
import { CarrinhoItemDto } from "./dtos/carrinho-item.dto";

export interface ValidarCarrinhoResponseDto {
    itensRemovidos: { produtoId: number; motivo: string }[];
}

// Endpoints exigem `@ApiPessoa()` -- só chamar quando `AutenticacaoService.estaAutenticado()`.
@Injectable({ providedIn: 'root' })
export class CarrinhoDataSource extends RemoteDataSourceBase<any> {
    path = 'carrinho';

    constructor(http: HttpClient) {
        super(http);
    }

    listar(): Observable<CarrinhoItemViewDto[]> {
        return this.getList({
            queryParameters: { ecommerceId: environment.ecommerceId },
        });
    }

    upsertItem(item: CarrinhoItemDto): Observable<CarrinhoItemViewDto> {
        return this.post({ path: '/itens', body: item });
    }

    removerItem(produtoId: number): Observable<void> {
        return this.delete({ path: `/itens/${produtoId}` });
    }

    validar(): Observable<ValidarCarrinhoResponseDto> {
        return this.post({ path: '/validar', queryParameters: { ecommerceId: environment.ecommerceId } });
    }
}
