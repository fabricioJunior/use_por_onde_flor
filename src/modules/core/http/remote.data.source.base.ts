import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";


@Injectable()
export abstract class RemoteDataSourceBase<Dto> {
    abstract path: string;

    constructor(private http: HttpClient) { }

    protected get(options?: RequestOptions): Observable<Dto> {
        var url = this.path;

        console.log(this.path);
        if (options?.pathArguments != null) {
            url = this.insertPathArguments(url, options.pathArguments);
        }
        console.log(url);
        return this.http.get<Dto>(url);
    }

    private insertPathArguments(url: string, pathArguments: Arguments): string {
        var keys = Object.keys(pathArguments);
        var localUrl = url;
        keys.forEach((key) => {
            localUrl = localUrl.replace("{" + key + "}", pathArguments[key]);
        });
        return localUrl;
    }

    protected post(options?: RequestOptions): Observable<Dto> {

        if (options?.responseType == 'text') {
            return this.http.post(this.path, options?.body, {
                responseType: 'text'
            }) as Observable<Dto>;
        }
        return this.http.post<Dto>(this.path, options?.body, {
            responseType: 'json'
        });
    }
}

export class RequestOptions {

    pathArguments?: Arguments;
    queryArumgnets?: Arguments;
    body?: object;
    responseType?: string;

    constructor(partial?: Partial<RequestOptions>) {
        Object.assign(this, partial);

    }
}

type Arguments = Record<string, string>;
