import { HttpClient, HttpInterceptorFn } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LocalStorageService } from "../../modules/core/local_storage/local-storage.service";
import { TokensDto } from "../../modules/autenticacao/data/dto/tokens.dto";

@Injectable()
export class ConfigService {
    configUrl = 'assets/config.json';

    constructor(private http: HttpClient) {

    }


}

export const ApiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    var localStorageService = inject(LocalStorageService);

    var tokens = localStorageService.get<TokensDto>('token') as TokensDto;
    console.log("Tokens:", tokens);
    const apiReq = req.clone({
        url: `https://apollo-api-stg.coralcloud.app/${req.url}`,
        headers: req.headers.set('Authorization', 'Bearer ' + tokens.tokenDeAcesso),
    },);
    return next(apiReq);
};