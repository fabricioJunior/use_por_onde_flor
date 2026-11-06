import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { OpcoesPagamentoPublicoDto, PedidoDetalheDto } from "./dto/pedido-detalhe.dto";

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

    opcoesPagamento(id: number, token: string): Observable<OpcoesPagamentoPublicoDto> {
        return this.get({ path: `/${id}/opcoes-pagamento`, queryParameters: { token } });
    }

    // O backend devolve a cobrança criada; o site relê o pedido em seguida (buscar), que já traz o link de pagamento.
    escolherPagamento(id: number, token: string, formaDePagamentoId: number): Observable<unknown> {
        return this.post({ path: `/${id}/pagamento`, queryParameters: { token }, body: { formaDePagamentoId } });
    }

    reenviarEmail(id: number, token: string): Observable<void> {
        return this.post({ path: `/${id}/reenviar-email`, queryParameters: { token } }) as unknown as Observable<void>;
    }
}
