import { HttpClient } from "@angular/common/http";
import { ProdutoDto } from "./dtos/produto.dto";
import { firstValueFrom } from "rxjs";
import { CruzamentoCoresETamanhosDto } from "./dtos/cor.tamanho";
import { Inject, Injectable } from "@angular/core";
@Injectable()
export class ProdutoDataSource {

    url = 'https://estoque.coralcloud.app/';
    // url = 'http://localhost:5080/'
    constructor(private http: HttpClient) {


    }

    async getProdutos(): Promise<ProdutoDto[]> {
        var produtos = await firstValueFrom(this.http.get<ProdutoDto[]>(this.url + 'estoque'));
        return produtos;
    }

    async getProdutosComFiltro(filtro: ProdutoFiltro): Promise<ProdutoDto[]> {
        var args = 'estoque/filtro?estoqueMaiorQueZero=' + (filtro.estoqueMaiorQueZero ?? true);

        if (filtro.descricao != null && filtro.descricao != '') {
            args += '&descricao=' + filtro.descricao;
        }
        if (filtro.tamanhos != null && filtro.tamanhos?.length > 0) {
            var tamanhoArg = filtro.tamanhos.join();
            args += '&tamanhos=' + tamanhoArg;
        }
        if (filtro.cores != null && filtro.cores?.length > 0) {
            var coresArg = filtro.cores.join();
            args += '&cores=' + coresArg;
        }
        if (filtro.referencia != null && filtro.referencia != '') {
            args += '&referencia=' + filtro.referencia;
        }

        var produtos = await firstValueFrom(this.http.get<ProdutoDto[]>(this.url + args));
        return produtos;
    }


    async getCores(): Promise<string[]> {
        return await firstValueFrom(this.http.get<string[]>(this.url + 'estoque/cores'));
    }
    async getTamanhos(): Promise<string[]> {
        return await firstValueFrom(this.http.get<string[]>(this.url + 'estoque/tamanhos'));
    }

    async getCruzamentoTamanhoCor(): Promise<CruzamentoCoresETamanhosDto> {
        return await firstValueFrom(this.http.get<CruzamentoCoresETamanhosDto>(this.url + 'estoque/tamanhoCor'));
    }



}

class ProdutoFiltro {
    descricao?: string;
    cores?: string[];
    tamanhos?: string[];
    referencia?: string;
    estoqueMaiorQueZero?: boolean = true;
}