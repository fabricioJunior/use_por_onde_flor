import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { HttpClient } from "@angular/common/http";
import { PagamentoPendenteDto } from "./dto/pagamento.pendente.dto";
import { Injectable } from "@angular/core";
import { PagamentoFinalizadoDto } from "./dto/pagamento.finalizado.dto";
import { PagamentoDto } from "./dto/pagamento.dto";
import { UrlComprovanteDto } from "./dto/url.comprovante.dto";
import { environment } from "../../../environments/environment";
//http://localhost:4200/pagamento?idPedido=6395
//
@Injectable()
export class PagamentoDatasource {
    url = `${environment.pagamentoApiUrl}/`;

    constructor(private http: HttpClient) { }

    getUrlPagamento(idPedido?: string, orderNsu?: string, valor?: number, identificador?: string): Observable<String> {
        var uri = this.url + '/v1/pagamentos-avulsos/public/comprovante/{id}';
        if (idPedido) {
            uri = uri + 'idPedido=' + idPedido + '&';
        }
        if (valor) {
            uri = uri + 'valor=' + valor + '&';
        }
        if (identificador) {

            uri = uri + 'identificador=' + identificador + '&';
        }
        if (orderNsu) {
            uri = uri + 'orderNsu=' + orderNsu + '&';
        }

        return this.http.get(uri, {
            responseType: 'text',
        });
    }

    getPagamentos(find: FindPagamentosPendentes): Observable<PagamentoDto[]> {

        var uri = this.url + 'pagamento/recuperarPagamentosOnline?';
        if (find.pagamentosDeHoje) {
            uri = uri + 'pagamentosDeHoje=' + find.pagamentosDeHoje + '&';
        }
        if (find.identificador) {
            uri = uri + 'identificador=' + find.identificador + '&';
        }
        return this.http.get<PagamentoDto[]>(uri);

    }


    getPedidoPendente(idPedido?: string, orderNsu?: string): Observable<PagamentoPendenteDto> {
        var uri = this.url + 'pagamento/pedidoComPagamentoPendente?';
        if (idPedido) {
            uri += 'idPedido=' + idPedido;
        }
        if (orderNsu) {
            uri += 'orderNsu=' + idPedido;
        }

        return this.http.get<PagamentoPendenteDto>(uri);
    }

    getPagamento(orderNsu: string): Observable<UrlComprovanteDto> {
        var uri = this.url + `v1/pagamentos-avulsos/public/comprovante/${orderNsu}`;
        return this.http.get<UrlComprovanteDto>(uri);
    }

    getUrlPagamentoPorOrderNsu(orderNsu: string): Observable<{ urlDePagamento: string }> {
        var uri = this.url + `v1/pagamentos-avulsos/public/pagamento/${orderNsu}`;
        return this.http.get<{ urlDePagamento: string }>(uri);
    }



    postPagamentoFinalizado(pagamento: PagamentoFinalizadoDto): Observable<PagamentoPendenteDto> {
        return this.http.post<PagamentoPendenteDto>(this.url + 'pagamento', pagamento,);
    }

    cancelarPagamento(orderNsu: string) {
        return this.http.post<PagamentoPendenteDto>(this.url + 'pagamento/cancelar?orderNsu=' + orderNsu, {});
    }

    reativarPagamento(orderNsu: string) {
        return this.http.post<PagamentoDto>(this.url + 'pagamento/ativar?orderNsu=' + orderNsu, {});
    }




}

export class FindPagamentosPendentes {

    pagamentosDeHoje?: boolean
    identificador?: string;

}

