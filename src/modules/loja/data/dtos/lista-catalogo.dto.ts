// Contrato público de listas do catálogo (apollo-api, GET /catalogos/vitrine/* e /catalogos/listas/*).
import { EcommerceReferenciaDto } from "./ecommerce-referencia.dto";

export interface ListaResumoDto {
    id: number;
    nome: string;
    descricao?: string | null;
    icone?: string | null;
    ordem: number;
}

export interface VitrineMenuListaDto extends ListaResumoDto {
    tipo: 'lista';
}

export interface VitrineMenuGrupoDto extends ListaResumoDto {
    tipo: 'grupo';
    listas: ListaResumoDto[];
}

export type VitrineMenuItemDto = VitrineMenuListaDto | VitrineMenuGrupoDto;

export interface VitrineHomeListaDto extends ListaResumoDto {
    referencias: EcommerceReferenciaDto[];
}

export interface ListaCatalogoDetalheDto {
    id: number;
    nome: string;
    descricao?: string | null;
    icone?: string | null;
    tipo: 'catalogo';
    modo: 'manual' | 'filtro';
}
