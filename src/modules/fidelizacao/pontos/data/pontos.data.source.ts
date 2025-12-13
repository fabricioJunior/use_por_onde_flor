import { firstValueFrom } from "rxjs";
import { RemoteDataSourceBase } from "../../../core/http/remote.data.source.base";
import { PontoDto } from "./dto/ponto.dto";
import { Injectable } from "@angular/core";
import { PontosDto } from "./dto/pontos.dto";

@Injectable()
export class PontosDataSource extends RemoteDataSourceBase<PontosDto> {
    override path = 'v1/pessoas-usuarios/saldo-pontos';



    recuperarPontos(): Promise<PontosDto> {
        var observable = this.get();
        return firstValueFrom(observable);
    }


}



