import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { ReferenciaMidiaDto } from "../../referencias/data/referencia.data.source";

// GET v1/referencias/{id}/midias/publicas -- mais completo que o `media_url` único do catálogo
// (`EcommerceReferenciaDto`), usado pra montar a galeria da página de produto.
@Injectable({ providedIn: 'root' })
export class ReferenciaMidiaPublicaDataSource extends RemoteDataSourceBase<ReferenciaMidiaDto> {
    path = 'v1/referencias/{id}/midias/publicas';

    constructor(http: HttpClient) {
        super(http);
    }

    listar(referenciaId: string): Observable<ReferenciaMidiaDto[]> {
        return this.getList({ pathArguments: { id: referenciaId } });
    }
}
