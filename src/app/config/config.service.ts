import { HttpClient, HttpInterceptorFn } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LocalStorageService } from "../../modules/core/local_storage/local-storage.service";
import { TokensDto } from "../../modules/autenticacao/data/dto/tokens.dto";
import { Router } from "@angular/router";

@Injectable()
export class ConfigService {
    configUrl = 'assets/config.json';

    constructor(private http: HttpClient) {

    }


}

export const ApiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    var localStorageService = inject(LocalStorageService);
    console.log("url", req.url);
    var tokens = localStorageService.get<TokensDto>('token') as TokensDto || undefined;
    console.log('acesso no config');
    console.log(tokens);
    if (req.url.includes('http') || req.url.includes('pagamento')) {
        console.log("url", req.url);
        return next(req);
    } else {



        if (req.url == 'v1/pessoas-usuarios/perfil') {
            const apiReq = req.clone({
                url: `https://apollo-api-stg.coralcloud.app/${req.url}`,
                headers: req.headers,
            },);
            console.log("url", req.url);
            console.log("Tokens:", tokens);
            console.log("Tokens:", apiReq);
            return next(apiReq);
        }


        const apiReq = req.clone({
            url: `https://apollo-api-stg.coralcloud.app/${req.url}`,
            headers: req.headers.set('Authorization', 'Bearer ' + tokens?.tokenDeAcesso),
        },);
        return next(apiReq);
    }


};