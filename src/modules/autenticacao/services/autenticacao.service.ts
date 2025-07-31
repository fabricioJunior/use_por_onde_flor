import { firstValueFrom, Observable } from "rxjs";
import { UsuarioEmailValidoDataSource } from "../data/usuario.email.valido.data.source";
import { InfoValidaDto } from "../data/dto/info.valida.dto";
import { UsuarioDocumentoValidoDataSource } from "../data/usuario.documento.valido.data.source";
import { Injectable } from "@angular/core";
import { UsuarioDto } from "../data/dto/usuario.dto";
import { UsuarioDataSource } from "../data/usuario.data.source";
import { LocalStorageService } from "../../core/local_storage/local-storage.service";
import { AutenticacaoDataSource } from "../data/autenticacao.data.source";
import { TokensDto } from "../data/dto/tokens.dto";

@Injectable()
export class AutenticacaoService {

    constructor(private usuarioEmailValidoDataSource: UsuarioEmailValidoDataSource,
        private usuarioDocumentoValidoDataSource: UsuarioDocumentoValidoDataSource,
        private usuarioDataSource: UsuarioDataSource,
        private autenticacaoDataSource: AutenticacaoDataSource,
        private localStorageService: LocalStorageService
    ) {

    }

    validarEmailValido(email: string): Observable<InfoValidaDto> {
        return this.usuarioEmailValidoDataSource.emailValido(email);
    }

    validarDocumentoValido(documento: string): Observable<InfoValidaDto> {
        return this.usuarioDocumentoValidoDataSource.documentoValido(documento);
    }

    criarUsuario(usuario: UsuarioDto): Observable<Object> {
        return this.usuarioDataSource.criarUsuario(usuario);
    }

    estaAutenticado(): boolean {

        const tokens = this.localStorageService.get('token') as TokensDto;

        if (tokens == null || (tokens.expiracao as Date).getTime() <= new Date().getTime()) {
            return false;
        }

        return true;
    }

    async recuperarUsuarioDaSessao(): Promise<UsuarioDto> {
        return this.localStorageService.get('usuario_da_sessao');
    }

    async fazerLogin(email: string, senha: string): Promise<boolean> {
        try {
            var tokens = await firstValueFrom(this.autenticacaoDataSource.getTokens(email, senha));

            this.localStorageService.set('token', tokens);
            var usuarioDaSessao = await firstValueFrom(this.usuarioDataSource.recuperarUsuario());

            this.localStorageService.set('usuario_da_sessao', usuarioDaSessao);

            return true;
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            return false;
        }
    }

}