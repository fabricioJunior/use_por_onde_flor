import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { HttpClient } from "@angular/common/http";
import { PagamentoPendenteDto } from "./dto/pagamento.pendente.dto";
import { Injectable } from "@angular/core";
//http://localhost:4200/pagamento?idPedido=6395
@Injectable()
export class PagamentoDatasource {
    url = 'https://estoque.coralcloud.app/';
    //url = 'http://localhost:5080/';
    constructor(private http: HttpClient) { }

    getUrlPagamento(idPedido: string): Observable<String> {
        return this.http.get(this.url + 'pagamento?' + 'idPedido=' + idPedido, {
            responseType: 'text',
        });
    }


    getPedidoPendente(idPedido: string): Observable<PagamentoPendenteDto> {
        return this.http.get<PagamentoPendenteDto>(this.url + 'pagamento/pedidoComPagamentoPendente?' + 'idPedido=' + idPedido);
    }

}

