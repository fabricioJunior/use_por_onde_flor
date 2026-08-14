import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { EnderecoDto } from "./dtos/endereco.dto";

// GET/POST pessoas-usuarios/enderecos -- self-service (pessoaId sempre resolvido no backend a
// partir do token de quem chama, nunca vai na URL). Checkout de convidado não tem pessoa
// autenticada a tempo de cadastrar endereço, então "entrega" fica restrito a quem está logado.
@Injectable({ providedIn: 'root' })
export class EnderecoDataSource extends RemoteDataSourceBase<EnderecoDto> {
    path = 'v1/pessoas-usuarios/enderecos';

    constructor(http: HttpClient) {
        super(http);
    }

    listar(): Observable<EnderecoDto[]> {
        return this.getList();
    }

    criar(endereco: EnderecoDto): Observable<EnderecoDto> {
        return this.post({ body: endereco });
    }
}
