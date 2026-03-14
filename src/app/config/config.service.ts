import { HttpClient, HttpInterceptorFn } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LocalStorageService } from "../../modules/core/local_storage/local-storage.service";
import { TokensDto } from "../../modules/autenticacao/data/dto/tokens.dto";
import { environment } from "../../environments/environment";


@Injectable()
export class ConfigService {
    configUrl = 'assets/config.json';

    constructor(private http: HttpClient) {

    }


}

export function recuperarEmpresaAtual(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const empresaQuery = new URLSearchParams(window.location.search).get('empresa');
    if (empresaQuery && empresaQuery.trim() !== '') {
        return empresaQuery.trim();
    }

    const empresaStorageRaw = localStorage.getItem('empresa');
    if (!empresaStorageRaw) {
        return null;
    }

    try {
        const empresaStorage = JSON.parse(empresaStorageRaw);
        if (typeof empresaStorage === 'string') {
            return empresaStorage.trim();
        }

        if (empresaStorage && typeof empresaStorage.nome === 'string') {
            return empresaStorage.nome.trim();
        }
    } catch {
        return empresaStorageRaw.trim();
    }

    return null;
}

export function resolverEmpresaId(empresa: string | null): number {
    const empresaNormalizada = (empresa ?? '').trim().toLowerCase();

    if (!empresaNormalizada) {
        return environment.empresaPadraoId;
    }

    const empresaMapeada = environment.empresas[empresaNormalizada];
    if (empresaMapeada != null) {
        return empresaMapeada;
    }

    const empresaIdNumerico = Number(empresaNormalizada);
    if (Number.isInteger(empresaIdNumerico) && empresaIdNumerico > 0) {
        return empresaIdNumerico;
    }

    return environment.empresaPadraoId;
}

export const ApiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    var localStorageService = inject(LocalStorageService);
    console.log("url", req.url);
    var tokens = localStorageService.get<TokensDto>('token') as TokensDto || undefined;
    console.log('acesso no config');
    console.log(tokens);
    if (req.url.includes('http') || req.url.includes('pagamento') || req.url.includes('pagamentos-avulsos')) {
        console.log("url", req.url);
        return next(req);
    } else {



        if (req.url == 'v1/pessoas-usuarios/perfil') {
            const apiReq = req.clone({
                url: `${environment.serverUrl}/${req.url}`,
                headers: req.headers,
            },);
            console.log("url", req.url);
            console.log("Tokens:", tokens);
            console.log("Tokens:", apiReq);
            return next(apiReq);
        }


        const apiReq = req.clone({
            url: `${environment.serverUrl}/${req.url}`,
            headers: req.headers.set('Authorization', 'Bearer ' + tokens?.tokenDeAcesso),
        },);
        return next(apiReq);
    }


};