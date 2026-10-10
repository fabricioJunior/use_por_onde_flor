// Shapes de `EcommerceCatalogoListasService` (apollo-api) -- ver
// apps/api/src/modules/ecommerce/ecommerce-catalogo/ecommerce-catalogo-listas.service.ts.
// ATENÇÃO: menu/home têm cache de 30s no backend -- mudança no admin demora até isso pra aparecer.
import { EcommerceReferenciaDto } from "./ecommerce-referencia.dto";

export interface VitrineListaResumoDto {
    id: number;
    nome: string | null;
    descricao: string | null;
    icone: string | null;
    ordem: number;
}

// `tipo: 'grupo'` traz `listas` (um nível só -- o backend não tem 3º nível).
export type VitrineMenuItemDto = VitrineListaResumoDto & (
    { tipo: 'lista' } | { tipo: 'grupo'; listas: VitrineListaResumoDto[] }
);

export interface VitrineHomeItemDto extends VitrineListaResumoDto {
    referencias: EcommerceReferenciaDto[];
}

export interface ListaDetalheDto {
    id: number;
    nome: string | null;
    descricao: string | null;
    icone: string | null;
    tipo: 'catalogo';
    modo: 'manual' | 'filtro';
}
