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

    async getProdutosComFiltro(descricao: string, cores?: string[], tamanhos?: string[]): Promise<ProdutoDto[]> {
        var args = 'estoque/filtro?descricao=' + descricao + '&estoqueMaiorQueZero=true';
        if (tamanhos != null && tamanhos?.length > 0) {
            var tamanhoArg = tamanhos.join();
            args += '&tamanhos=' + tamanhoArg;
        }
        if (cores != null && cores?.length > 0) {
            var coresArg = cores.join();
            args += '&cores=' + coresArg;
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