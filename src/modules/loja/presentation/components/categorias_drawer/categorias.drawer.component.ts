import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { LojaDataSource } from "../../../data/loja.data.source";
import { CategoriaDto } from "../../../data/dtos/categoria.dto";

// Drawer lateral com as categorias do site -- aberto pelo botão de menu no header, disponível em
// qualquer página (diferente do rail de categorias, que só existe na home). Busca só na primeira
// vez que abre (categorias mudam raramente, não vale re-buscar toda vez).
@Component({
    selector: 'categorias-drawer',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './categorias.drawer.component.html',
    styleUrl: './categorias.drawer.component.css',
})
export class CategoriasDrawerComponent implements OnChanges {
    @Input() aberto = false;
    @Output() fechar = new EventEmitter<void>();

    categorias = signal<CategoriaDto[]>([]);
    carregando = signal(false);
    erro = signal(false);
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
            const categorias = await firstValueFrom(this.lojaDataSource.listarCategorias());
            this.categorias.set(categorias.filter((categoria) => !categoria.inativa));
        } catch {
            this.jaCarregou = false;
            this.erro.set(true);
        } finally {
            this.carregando.set(false);
        }
    }

    fecharDrawer(): void {
        this.fechar.emit();
    }
}
