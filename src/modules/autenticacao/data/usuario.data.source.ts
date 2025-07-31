import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { UsuarioDto } from "./dto/usuario.dto";
import { Injectable } from "@angular/core";

@Injectable()
export class UsuarioDataSource extends RemoteDataSourceBase<Object> {
    override path = 'v1/pessoas-usuarios/';


    criarUsuario(usuario: UsuarioDto): Observable<Object> {
        return this.post(
            {
                body: usuario,
                responseType: 'text',
                path: 'registrar'
            }
        )
    }

    recuperarUsuario(): Observable<UsuarioDto> {

        return this.get(
            {
                path: 'perfil'
            }
        );
    }
}