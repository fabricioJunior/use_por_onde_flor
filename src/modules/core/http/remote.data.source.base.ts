import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class RemoteDataSourceBase<Dto> {
    abstract path: string;

    constructor(private http: HttpClient) { }

    protected get(options?: RequestOptions): Observable<Dto> {
        return this.http.get<Dto>(this.buildUrl(options), this.buildHttpOptions(options));
    }

    protected getList(options?: RequestOptions): Observable<Dto[]> {
        return this.http.get<Dto[]>(this.buildUrl(options), this.buildHttpOptions(options));
    }

    protected post(options?: RequestOptions): Observable<Dto> {
        if (options?.responseType == 'text') {
            return this.http.post(this.buildUrl(options), options?.body, {
                ...this.buildHttpOptions(options),
                responseType: 'text',
            }) as Observable<Dto>;
        }
        return this.http.post<Dto>(this.buildUrl(options), options?.body, this.buildHttpOptions(options));
    }

    protected put(options?: RequestOptions): Observable<Dto> {
        return this.http.put<Dto>(this.buildUrl(options), options?.body, this.buildHttpOptions(options));
    }

    protected delete(options?: RequestOptions): Observable<Dto> {
        return this.http.delete<Dto>(this.buildUrl(options), this.buildHttpOptions(options));
    }

    private buildUrl(options?: RequestOptions): string {
        var url = this.path;
        if (options?.pathArguments != null) {
            url = this.insertPathArguments(url, options.pathArguments);
        }
        if (options?.path != null) {
            url = this.insertPath(url, options.path);
        }
        return url;
    }

    // Authorization manual (`options.authToken`) só existe pra compatibilidade com quem já chamava
    // assim (ex: `UsuarioDataSource.recuperarUsuario` durante o login, antes de o interceptor ter
    // token salvo). Fora desse caso, deixe o `ApiBaseUrlInterceptor` resolver o Bearer sozinho --
    // não passe `authToken` pra não colidir com a lógica dele.
    private buildHttpOptions(options?: RequestOptions): { headers?: Record<string, string>; params?: HttpParams } {
        var result: { headers?: Record<string, string>; params?: HttpParams } = {};

        if (options?.authToken) {
            result.headers = { 'Authorization': 'Bearer ' + options.authToken };
        }

        if (options?.queryParameters != null) {
            var params = new HttpParams();
            Object.entries(options.queryParameters).forEach(([key, value]) => {
                if (value != null) {
                    params = params.set(key, value);
                }
            });
            result.params = params;
        }

        return result;
    }

    private insertPathArguments(url: string, pathArguments: Arguments): string {
        var keys = Object.keys(pathArguments);
        var localUrl = url;
        keys.forEach((key) => {
            localUrl = localUrl.replace("{" + key + "}", pathArguments[key]);
        });
        return localUrl;
    }

    private insertPath(url: string, path: string) {
        return url + path;
    }
}

export class RequestOptions {

    pathArguments?: Arguments;
    queryParameters?: Record<string, string | number | boolean>;
    body?: object;
    responseType?: string;
    path?: string;
    authToken?: string;

    constructor(partial?: Partial<RequestOptions>) {
        Object.assign(this, partial);
    }
}

type Arguments = Record<string, string>;
