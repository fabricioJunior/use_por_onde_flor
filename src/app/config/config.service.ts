import { HttpClient, HttpInterceptorFn } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class ConfigService {
    configUrl = 'assets/config.json';

    constructor(private http: HttpClient) {

    }


}

export const ApiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    const apiReq = req.clone({ url: `https://apollo-api-stg.coralcloud.app/${req.url}` });
    return next(apiReq);
};