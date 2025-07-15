import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { InfoValidaDto } from "./dto/info.valida.dto";
import { Injectable } from "@angular/core";

@Injectable()
export class UsuarioDocumentoValidoDataSource extends RemoteDataSourceBase<InfoValidaDto> {
    override path = 'v1/pessoas-usuarios/verificar-documento/{documento}'


    documentoValido(documento: string): Observable<InfoValidaDto> {
        return this.get(
            {
                pathArguments: {
                    'documento': documento
                }
            }
        );
    }
}

//https://apollo-api-stg.coralcloud.app/https://apol…soas-usuarios/verificar-documento/%7Bdocumento%7D