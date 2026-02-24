import { Injectable } from "@angular/core";
import { PontosDataSource } from "../data/pontos.data.source";
import { PontoDto } from "../data/dto/ponto.dto";
import { LocalStorageService } from "../../../core/local_storage/local-storage.service";
import { UsuarioDto } from "../../../autenticacao/data/dto/usuario.dto";
import { calcularSaldoPontos, PontosDto } from "../data/dto/pontos.dto";


@Injectable()
export class PontosService {

    constructor(private pontosDataSource: PontosDataSource, private localStorage: LocalStorageService) {

    }

    async recuperarPontos(): Promise<PontosDto> {
        const pontos = await this.pontosDataSource.recuperarPontos();

        return {
            ...pontos,
            saldoPontos: calcularSaldoPontos(pontos.historico)
        };
    }

    async recuperarUsuario(): Promise<UsuarioDto> {
        return this.localStorage.get('usuario_da_sessao') as UsuarioDto;
    }


}