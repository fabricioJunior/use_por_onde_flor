import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { environment } from "../../../environments/environment";
import { EcommerceReferenciaDto, EcommerceReferenciaProdutoDto, PaginationDto } from "./dtos/ecommerce-referencia.dto";

// Base fixa 'e-commerce/{ecommerceId}' -- cada método completa com o sufixo do endpoint via
// `options.path` (RemoteDataSourceBase concatena path + pathArguments + suffix).
@Injectable({ providedIn: 'root' })
export class LojaDataSource extends RemoteDataSourceBase<any> {
    path = 'v1/e-commerce/{ecommerceId}';

    constructor(http: HttpClient) {
        super(http);
    }

    private ecommerceArgs(): Record<string, string> {
        return { ecommerceId: environment.ecommerceId.toString() };
    }

    listarReferencias(page: number, limit: number): Observable<PaginationDto<EcommerceReferenciaDto>> {
        return this.get({
            pathArguments: this.ecommerceArgs(),
            path: '/catalogos/referencias',
            queryParameters: { page, limit },
        });
    }

    buscarReferencia(id: string): Observable<EcommerceReferenciaDto> {
        return this.get({
            pathArguments: this.ecommerceArgs(),
            path: `/referencias/${id}`,
        });
    }

    listarProdutos(referenciaId: string): Observable<EcommerceReferenciaProdutoDto[]> {
        return this.getList({
            pathArguments: this.ecommerceArgs(),
            path: `/referencias/${referenciaId}/produtos`,
        });
    }

    status(): Observable<{ aberto: boolean }> {
        return this.get({
            pathArguments: this.ecommerceArgs(),
            path: '/status',
        });
    }

    formaPagamento(): Observable<{ formaDePagamentoId: number; descricao: string; provider?: string }> {
        return this.get({
            pathArguments: this.ecommerceArgs(),
            path: '/forma-pagamento',
        });
    }
}
