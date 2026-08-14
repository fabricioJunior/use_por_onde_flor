import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { PedidoDetalheDto } from "./dto/pedido-detalhe.dto";

// Acesso ao pedido sem login, via link com token (ver PedidoEntity.tokenAcesso no apollo-api) --
// usado no redirect pós-pagamento e em links compartilháveis, diferente de PedidosDataSource
// (que exige pessoa autenticada, "meus pedidos").
@Injectable()
export class PedidoPublicoDataSource extends RemoteDataSourceBase<any> {
    path = 'v1/pedidos/publico';

    constructor(http: HttpClient) {
        super(http);
    }

    buscar(id: number, token: string): Observable<PedidoDetalheDto> {
        return this.get({ path: '/' + id, queryParameters: { token } });
    }
}
