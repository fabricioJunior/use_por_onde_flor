import { firstValueFrom, Observable } from "rxjs";
import { PagamentoDatasource } from "../data/pagamento.datasource";
import { PagamentoPendenteDto } from "../data/dto/pagamento.pendente.dto";
import { Injectable } from "@angular/core";

@Injectable()
export class PagamentoService {
    constructor(private pagamentoDatasource: PagamentoDatasource) { }

    getUrlPagamento(idPedido: string): Observable<String> {
        return this.pagamentoDatasource.getUrlPagamento(idPedido);
    }

    async getPedidoPendente(idPedido: string): Promise<PagamentoPendenteDto> {
        if (!idPedido) {
            throw new Error("ID do pedido não fornecido.");
        }
        return firstValueFrom(this.pagamentoDatasource.getPedidoPendente(idPedido));

    }

    async finalizarPedido(pagamento: PagamentoPendenteDto) {
        return this.pagamentoDatasource.postPagamentoFinalizado(pagamento);
    }
}