import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { LojaDataSource } from "../../../data/loja.data.source";
import { VitrineMenuItemDto } from "../../../data/dtos/lista-catalogo.dto";

// Drawer lateral com as listas/grupos da vitrine (menu) -- aberto pelo botão de menu no header,
// disponível em qualquer página. Busca só na primeira vez que abre. Grupo = item expansível.
@Component({
    selector: 'listas-drawer',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './listas.drawer.component.html',
    styleUrl: './listas.drawer.component.css',
})
export class ListasDrawerComponent implements OnChanges {
    @Input() aberto = false;
    @Output() fechar = new EventEmitter<void>();

    itens = signal<VitrineMenuItemDto[]>([]);
    carregando = signal(false);
    erro = signal(false);
    gruposAbertos = signal<ReadonlySet<number>>(new Set());
    private jaCarregou = false;

    constructor(private lojaDataSource: LojaDataSource) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aberto']?.currentValue && !this.jaCarregou) {
            this.carregar();
        }
    }

    private async carregar(): Promise<void> {
        this.jaCarregou = true;
        this.carregando.set(true);
        this.erro.set(false);
        try {
            this.itens.set(await firstValueFrom(this.lojaDataSource.vitrineMenu()));
        } catch {
            this.jaCarregou = false;
            this.erro.set(true);
        } finally {
            this.carregando.set(false);
        }
    }

    alternarGrupo(id: number): void {
        const novo = new Set(this.gruposAbertos());
        if (!novo.delete(id)) {
            novo.add(id);
        }
        this.gruposAbertos.set(novo);
    }

    fecharDrawer(): void {
        this.fechar.emit();
    }
}
