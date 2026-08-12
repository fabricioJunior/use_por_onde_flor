import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { PedidosListaDto } from "./dto/pedidos-lista.dto";
import { PedidoDetalheDto } from "./dto/pedido-detalhe.dto";

@Injectable()
export class PedidosDataSource extends RemoteDataSourceBase<any> {
    path = 'v1/pessoas-usuarios/meus-pedidos';

    constructor(http: HttpClient) {
        super(http);
    }

    listar(pagina: number, itensPorPagina: number): Observable<PedidosListaDto> {
        return this.get({ queryParameters: { pagina, itensPorPagina } });
    }

    buscar(id: number): Observable<PedidoDetalheDto> {
        return this.get({ path: '/' + id });
    }
}
