import { TestBed } from "@angular/core/testing";
import { HttpRequest } from "@angular/common/http";
import { ApiBaseUrlInterceptor } from "./config.service";
import { LocalStorageService } from "../../modules/core/local_storage/local-storage.service";
import { environment } from "../../environments/environment";

describe('ApiBaseUrlInterceptor', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: LocalStorageService, useValue: { get: () => null } }],
        });
    });

    // Regressão: 'forma-pagamento' contém a substring "pagamento" e era pego pelo bypass pensado
    // pra URLs absolutas de gateway de pagamento -- ficava sem o prefixo de environment.serverUrl
    // e batia em host errado (a própria origem do site, não a API).
    it('prefixes environment.serverUrl for a relative url containing "pagamento" that is not absolute', () => {
        const req = new HttpRequest('GET', 'v1/e-commerce/7/forma-pagamento');
        let forwardedUrl = '';

        TestBed.runInInjectionContext(() => {
            ApiBaseUrlInterceptor(req, (r) => {
                forwardedUrl = r.url;
                return null as any;
            });
        });

        expect(forwardedUrl).toBe(`${environment.serverUrl}/v1/e-commerce/7/forma-pagamento`);
    });

    it('does not prefix an already-absolute url', () => {
        const req = new HttpRequest('GET', `${environment.pagamentoApiUrl}/pagamento`);
        let forwardedUrl = '';

        TestBed.runInInjectionContext(() => {
            ApiBaseUrlInterceptor(req, (r) => {
                forwardedUrl = r.url;
                return null as any;
            });
        });

        expect(forwardedUrl).toBe(`${environment.pagamentoApiUrl}/pagamento`);
    });
});
