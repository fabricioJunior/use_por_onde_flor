// Shape de `CategoriaEntity` (apollo-api) -- ver apps/api/src/modules/categoria/entities/category.entity.ts.
export interface CategoriaDto {
    id: number;
    nome: string;
    inativa: boolean;
    descricao?: string;
    icone?: string;
}
