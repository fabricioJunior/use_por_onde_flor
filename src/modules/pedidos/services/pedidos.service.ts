import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { PedidosDataSource } from "../data/pedidos.data.source";
import { PedidosListaDto } from "../data/dto/pedidos-lista.dto";
import { PedidoDetalheDto } from "../data/dto/pedido-detalhe.dto";

@Injectable()
export class PedidosService {

    constructor(private pedidosDataSource: PedidosDataSource) { }

    listar(pagina: number, itensPorPagina: number): Promise<PedidosListaDto> {
        return firstValueFrom(this.pedidosDataSource.listar(pagina, itensPorPagina));
    }

    buscar(id: number): Promise<PedidoDetalheDto> {
        return firstValueFrom(this.pedidosDataSource.buscar(id));
    }
}
