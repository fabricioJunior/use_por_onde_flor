import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { CategoriaDto } from "./dtos/categoria.dto";

@Injectable({ providedIn: 'root' })
export class CategoriaDataSource extends RemoteDataSourceBase<any> {
    path = 'v1/categorias';

    constructor(http: HttpClient) {
        super(http);
    }

    listar(): Observable<CategoriaDto[]> {
        return this.getList({ queryParameters: { inativa: false } });
    }

    buscar(id: number): Observable<CategoriaDto> {
        return this.get({ path: `/${id}` });
    }
}
