import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { InfoValidaDto } from "./dto/info.valida.dto";
import { Injectable } from "@angular/core";

@Injectable()
export class UsuarioEmailValidoDataSource extends RemoteDataSourceBase<InfoValidaDto> {
    override path = 'v1/pessoas-usuarios/verificar-email/{email}';


    emailValido(email: string): Observable<InfoValidaDto> {
        return this.get({
            pathArguments: {
                'email': email
            }
        });
    }


}