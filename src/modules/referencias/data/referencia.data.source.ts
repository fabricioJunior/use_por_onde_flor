import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

export interface CategoriaReferenciaDto {
    id: number;
    nome: string;
    inativa?: boolean;
}

export interface ReferenciaDto {
    id: number;
    nome: string;
    idExterno?: string;
    unidadeMedida?: string;
    categoriaId?: number;
    subCategoriaId?: number;
    marcaId?: number;
    descricao?: string;
    composicao?: string;
    cuidados?: string;
    categoria?: CategoriaReferenciaDto;
    subCategoria?: CategoriaReferenciaDto;
}

export interface ReferenciaMidiaDto {
    id: number;
    referenciaId: number;
    type?: string;
    url: string;
    description?: string;
    cor?: string;
    tamanho?: string;
    estampa?: string;
    isDefault?: boolean;
    isPublic?: boolean;
}

@Injectable()
export class ReferenciaDataSource {
    constructor(private http: HttpClient) { }

    async getReferencia(id: string): Promise<ReferenciaDto> {
        return await firstValueFrom(this.http.get<ReferenciaDto>(`v1/referencias/${id}`));
    }

    async getMidias(referencia: string): Promise<ReferenciaMidiaDto[]> {
        const response = await firstValueFrom(
            this.http.get<ReferenciaMidiaDto[] | ReferenciaMidiaDto>(`v1/referencias/${referencia}/midias`)
        );

        if (Array.isArray(response)) {
            return response;
        }

        return response ? [response] : [];
    }
}
