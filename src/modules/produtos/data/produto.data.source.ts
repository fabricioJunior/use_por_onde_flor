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

    async getProdutosComFiltro(descricao: string): Promise<ProdutoDto[]> {
        var produtos = await firstValueFrom(this.http.get<ProdutoDto[]>(this.url + 'estoque/filtro?descricao=' + descricao + '&estoqueMaiorQueZero=true'));
        return produtos;
    }

    async getCores(): Promise<String[]> {
        return await firstValueFrom(this.http.get<String[]>(this.url + 'estoque/cores'));
    }
    async getTamanhos(): Promise<String[]> {
        return await firstValueFrom(this.http.get<String[]>(this.url + 'estoque/tamanhos'));
    }

    async getCruzamentoTamanhoCor(): Promise<CruzamentoCoresETamanhosDto> {
        return await firstValueFrom(this.http.get<CruzamentoCoresETamanhosDto>(this.url + 'estoque/tamanhoCor'));
    }



}