import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { environment } from "../../../environments/environment";
import { EcommerceReferenciaDto, EcommerceReferenciaProdutoDto, PaginationDto } from "./dtos/ecommerce-referencia.dto";
import { PromocaoDto } from "./dtos/promocao.dto";

// Base fixa 'e-commerce/{ecommerceId}' -- cada método completa com o sufixo do endpoint via
// `options.path` (RemoteDataSourceBase concatena path + pathArguments + suffix).
@Injectable({ providedIn: 'root' })
export class LojaDataSource extends RemoteDataSourceBase<any> {
    path = 'v1/e-commerce/{ecommerceId}';

    constructor(http: HttpClient) {
        super(http);
    }

    private ecommerceArgs(): Record<string, string> {
        return { ecommerceId: environment.ecommerceId.toString() };
    }

    listarReferencias(page: number, limit: number, search?: string): Observable<PaginationDto<EcommerceReferenciaDto>> {
        return this.get({
            pathArguments: this.ecommerceArgs(),
            path: '/catalogos/referencias',
            queryParameters: search ? { page, limit, search } : { page, limit },
        });
    }

    buscarReferencia(id: string): Observable<EcommerceReferenciaDto> {
        return this.get({
            pathArguments: this.ecommerceArgs(),
            path: `/catalogos/referencias/${id}`,
        });
    }

    listarProdutos(referenciaId: string): Observable<EcommerceReferenciaProdutoDto[]> {
        return this.getList({
            pathArguments: this.ecommerceArgs(),
            path: `/catalogos/referencias/${referenciaId}/produtos`,
        });
    }

    status(): Observable<{ aberto: boolean }> {
        return this.get({
            pathArguments: this.ecommerceArgs(),
            path: '/status',
        });
    }

    // Promoções ativas/vigentes da empresa do e-commerce -- usado pra calcular preço com desconto
    // no catálogo (ver PromocaoPrecoService, aplica o cálculo client-side).
    promocoesAtivas(): Observable<{ items: PromocaoDto[]; total: number }> {
        return this.get({
            pathArguments: this.ecommerceArgs(),
            path: '/promocoes',
        });
    }

    // Enriquece item de carrinho de convidado (que só tem produtoId+quantidade no localStorage).
    produto(produtoId: number): Observable<{ produtoId: number; nome?: string; corNome?: string; tamanhoNome?: string; valor?: number; imagemUrl?: string }> {
        return this.get({
            pathArguments: this.ecommerceArgs(),
            path: `/produtos/${produtoId}`,
        });
    }

    formaPagamento(): Observable<{ formaDePagamentoId: number; descricao: string; provider?: string }[]> {
        return this.getList({
            pathArguments: this.ecommerceArgs(),
            path: '/forma-pagamento',
        });
    }
}
