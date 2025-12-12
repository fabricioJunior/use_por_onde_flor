import { Injectable } from "@angular/core";
import { PontosDataSource } from "../data/pontos.data.source";
import { PontoDto } from "../data/dto/ponto.dto";
import { LocalStorageService } from "../../../core/local_storage/local-storage.service";
import { UsuarioDto } from "../../../autenticacao/data/dto/usuario.dto";

@Injectable()
export class PontosService {

    constructor(private pontosDataSource: PontosDataSource, private localStorageService: LocalStorageService) {

    }


    recuperarPontos(): Promise<PontoDto[]> {

        var pessoa = this.localStorageService.get<UsuarioDto>('usuario_da_sessao') as UsuarioDto;
        var pessoaId = pessoa.id;
        return this.pontosDataSource.recuperarPontos({
            pessoaId: pessoaId!,
        });
    }

    async recuperarTotalPontos(): Promise<number> {
        var pessoa = this.localStorageService.get<UsuarioDto>('usuario_da_sessao') as UsuarioDto;
        var pessoaId = pessoa.id;
        var totalDePontos = await this.recuperarTotalPontos();
        return totalDePontos;
    }

}