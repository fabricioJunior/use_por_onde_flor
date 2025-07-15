import { Observable } from "rxjs";
import { UsuarioEmailValidoDataSource } from "../data/usuario.email.valido.data.source";
import { InfoValidaDto } from "../data/dto/info.valida.dto";
import { UsuarioDocumentoValidoDataSource } from "../data/usuario.documento.valido.data.source";
import { Injectable } from "@angular/core";
import { UsuarioDto } from "../data/dto/usuario.dto";
import { UsuarioDataSource } from "../data/usuario.data.source";

@Injectable()
export class LoginService {

    constructor(private usuarioEmailValidoDataSource: UsuarioEmailValidoDataSource,
        private usuarioDocumentoValidoDataSource: UsuarioDocumentoValidoDataSource,
        private usuarioDataSource: UsuarioDataSource,
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

}