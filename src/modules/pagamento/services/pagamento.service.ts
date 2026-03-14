import { firstValueFrom, Observable } from "rxjs";
import { FindPagamentosPendentes, PagamentoDatasource } from "../data/pagamento.datasource";
import { PagamentoPendenteDto } from "../data/dto/pagamento.pendente.dto";
import { Injectable } from "@angular/core";
import { PagamentoDto } from "../data/dto/pagamento.dto";
import { Md5 } from 'ts-md5';


@Injectable()
export class PagamentoService {
    constructor(private pagamentoDatasource: PagamentoDatasource) { }

    getUrlPagamentoPorOrderNsu(orderNsu: string): Observable<{ urlDePagamento: string }> {
        return this.pagamentoDatasource.getUrlPagamentoPorOrderNsu(orderNsu);
    }

    getUrlPagamento(idPedido: string): Observable<String> {
        return this.pagamentoDatasource.getUrlPagamento(idPedido);
    }

    async getPedidoPendente(idPedido: string): Promise<PagamentoPendenteDto> {
        if (!idPedido) {
            throw new Error("ID do pedido não fornecido.");
        }
        return firstValueFrom(this.pagamentoDatasource.getPedidoPendente(idPedido));

    }


    getPagamentos(find: FindPagamentosPendentes): Observable<PagamentoDto[]> {
        return this.pagamentoDatasource.getPagamentos(find);
    }

    getPagamento(orderNsu: string): Observable<PagamentoDto> {

        return this.pagamentoDatasource.getPagamento(orderNsu);
    }

    async getPagamentoNovo(valor: number, instagram?: string, telefone?: string): Promise<String> {
        var currentDate = new Date().toString();
        var keyToHash = valor.toString() + instagram?.toString() + telefone?.toString() + currentDate;
        var orderNsu = Md5.hashStr(keyToHash);
        var identificador = instagram ?? telefone;
        var result = await firstValueFrom(this.pagamentoDatasource.getUrlPagamento(undefined, orderNsu, valor, identificador));
        console.log('url de pagamento', result);
        return orderNsu;
    }

    async finalizarPedido(pagamento: PagamentoPendenteDto) {
        return this.pagamentoDatasource.postPagamentoFinalizado(pagamento);
    }

    async cancelarPagamento(orderNsu: string): Promise<PagamentoDto> {
        await firstValueFrom(this.pagamentoDatasource.cancelarPagamento(orderNsu));
        return await firstValueFrom(this.pagamentoDatasource.getPagamento(orderNsu));
    }

    async ativarPagamento(orderNsu: string): Promise<PagamentoDto> {
        await firstValueFrom(this.pagamentoDatasource.reativarPagamento(orderNsu));
        return await firstValueFrom(this.pagamentoDatasource.getPagamento(orderNsu));
    }
}