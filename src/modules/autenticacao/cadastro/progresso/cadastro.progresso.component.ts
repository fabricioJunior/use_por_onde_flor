import { Component, Input } from "@angular/core";

/**
 * Indicador de progresso do cadastro (traço horizontal + rótulo).
 * Usado no topo de cada etapa, exceto "fim".
 */
@Component({
    selector: 'app-cadastro-progresso',
    templateUrl: './cadastro.progresso.component.html',
    styleUrls: ['./cadastro.progresso.component.css'],
})
export class CadastroProgressoComponent {
    @Input() etapa: number = 1;
    @Input() total: number = 4;
    @Input() label: string = '';

    get offset(): number {
        return 100 - (this.etapa / this.total) * 100;
    }
}
