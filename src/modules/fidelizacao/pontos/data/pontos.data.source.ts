import { firstValueFrom } from "rxjs";
import { RemoteDataSourceBase } from "../../../core/http/remote.data.source.base";
import { PontoDto } from "./dto/ponto.dto";
import { Injectable } from "@angular/core";

@Injectable()
export class PontosDataSource extends RemoteDataSourceBase<PontoDto> {
    override path = '/v1/pessoas/{pessoaId}/transacoes-pontos';



    recuperarPontos(query: PontosQuery): Promise<PontoDto[]> {
        var observable = this.getList(
            {
                pathArguments: {
                    'pessoaId': query.pessoaId.toString(),
                }
            }

        );
        return firstValueFrom(observable);
    }


}



class PontosQuery {
    ids?: string[];
    empresaIds?: string[];
    tipos?: string[];
    pessoaId: number;


    constructor(pessoaId: number, partial?: Partial<PontoDto>) {
        this.pessoaId = pessoaId;
        Object.assign(this, partial);
    }
}