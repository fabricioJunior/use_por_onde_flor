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
import { RecuperarSenhaDataSource } from "../data/recuperar.senha.data.source";
import { RecuperarSenhaDto } from "../data/dto/recuperar.senha.dto";

@Injectable()
export class AutenticacaoService {

    constructor(private usuarioEmailValidoDataSource: UsuarioEmailValidoDataSource,
        private usuarioDocumentoValidoDataSource: UsuarioDocumentoValidoDataSource,
        private usuarioDataSource: UsuarioDataSource,
        private autenticacaoDataSource: AutenticacaoDataSource,
        private recuperarSenhaDataSource: RecuperarSenhaDataSource,
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

        const tokens = this.localStorageService.get('token') as TokensDto | null;

        if (tokens == undefined || tokens == null) {
            return false;
        }

        const expiracaoTime = new Date(tokens.expiracao ?? '').getTime();
        if (expiracaoTime <= new Date().getTime()) {
            return false;
        }

        return true;
    }

    async solicitaEsqueciSenha(email: string): Promise<RecuperarSenhaDto> {
        return this.recuperarSenhaDataSource.solicitarEsquecimentoDeSenha(email);
    }

    async mudarSenha(email: string, codigo: string): Promise<RecuperarSenhaDto> {
        return this.recuperarSenhaDataSource.redefinirSenha(email, codigo);
    }


    async fazerLogin(email: string, senha: string): Promise<boolean> {
        try {
            var tokens = await firstValueFrom(this.autenticacaoDataSource.getTokens(email, senha));

            await this.localStorageService.set('token', tokens);
            console.log(tokens.tokenDeAcesso);
            var usuarioDaSessao = await firstValueFrom(this.usuarioDataSource.recuperarUsuario(tokens.tokenDeAcesso));

            this.localStorageService.set('usuario_da_sessao', usuarioDaSessao);

            return true;
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            return false;
        }
    }

    async logout() {
        await this.localStorageService.clear();
    }

}