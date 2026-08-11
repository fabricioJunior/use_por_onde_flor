import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { EnderecoDto } from "./dtos/endereco.dto";

// GET/POST pessoas/{pessoaId}/enderecos -- só chamado quando a pessoa está autenticada (pessoaId
// vem do `UsuarioDto` salvo em 'usuario_da_sessao'). Checkout de convidado não tem pessoaId
// persistido a tempo de cadastrar endereço, então "entrega" fica restrito a quem está logado.
@Injectable({ providedIn: 'root' })
export class EnderecoDataSource extends RemoteDataSourceBase<EnderecoDto> {
    path = 'v1/pessoas/{pessoaId}/enderecos';

    constructor(http: HttpClient) {
        super(http);
    }

    listar(pessoaId: number): Observable<EnderecoDto[]> {
        return this.getList({ pathArguments: { pessoaId: pessoaId.toString() } });
    }

    criar(pessoaId: number, endereco: EnderecoDto): Observable<EnderecoDto> {
        return this.post({ pathArguments: { pessoaId: pessoaId.toString() }, body: endereco });
    }
}
