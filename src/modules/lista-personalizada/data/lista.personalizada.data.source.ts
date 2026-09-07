import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { ListaPersonalizadaPublicaDto } from "./dtos/lista-personalizada-publica.dto";

@Injectable({ providedIn: 'root' })
export class ListaPersonalizadaDataSource extends RemoteDataSourceBase<ListaPersonalizadaPublicaDto> {
    path = 'v1/listas-personalizadas';

    constructor(http: HttpClient) {
        super(http);
    }

    // Público, sem autenticação -- ver ApiBaseUrlInterceptor (não injeta token quando não há sessão).
    // 404 tanto pra hash inexistente quanto pra lista expirada/cancelada, propositalmente (não
    // diferenciar os casos, ver requisito de segurança em apollo-api ListaPersonalizadaService).
    buscarPublico(hash: string): Observable<ListaPersonalizadaPublicaDto> {
        return this.get({ path: `/publico/${hash}` });
    }
}
