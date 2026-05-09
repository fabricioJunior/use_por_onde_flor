import { Injectable } from "@angular/core";
import { ReferenciaDataSource, ReferenciaDto, ReferenciaMidiaDto } from "../data/referencia.data.source";

@Injectable()
export class ReferenciaService {
    constructor(private referenciaDataSource: ReferenciaDataSource) { }

    async carregarReferenciaPublica(referencia: string): Promise<{ referencia: ReferenciaDto, midias: ReferenciaMidiaDto[] }> {
        const [referenciaDto, midiasDto] = await Promise.all([
            this.referenciaDataSource.getReferencia(referencia),
            this.referenciaDataSource.getMidias(referencia),
        ]);

        const midias = [...midiasDto]
            .filter((midia) => midia?.url)
            .sort((a, b) => Number(b.isDefault ?? false) - Number(a.isDefault ?? false));

        const midiasPublicas = midias.filter((midia) => midia.isPublic !== false);

        return {
            referencia: referenciaDto,
            midias: midiasPublicas.length > 0 ? midiasPublicas : midias,
        };
    }
}
