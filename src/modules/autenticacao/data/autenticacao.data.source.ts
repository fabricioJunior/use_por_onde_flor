import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { TokensDto } from "./dto/tokens.dto";
import { Injectable } from "@angular/core";

@Injectable()
export class AutenticacaoDataSource extends RemoteDataSourceBase<TokensDto> {
    override path = 'v1/pessoas-usuarios/login';

    getTokens(email: string, senha: string): Observable<TokensDto> {
        return this.post(
            {
                body: {
                    'email': email,
                    'senha': senha,
                }
            }
        );

    }

}