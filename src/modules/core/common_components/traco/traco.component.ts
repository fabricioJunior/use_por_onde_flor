import { Component, Input } from "@angular/core";

/**
 * Traço da identidade — SVG full-bleed com path contínuo (0-100 viewBox).
 * Cada tela define seu próprio `d`; este componente só resolve a mecânica
 * (viewBox, non-scaling-stroke, opacidade, cor, animação de entrada/loop).
 */
@Component({
    selector: 'app-traco',
    templateUrl: './traco.component.html',
    styleUrls: ['./traco.component.css'],
})
export class TracoComponent {
    /** Path SVG (viewBox 0 0 100 100), coordenadas em % do container full-bleed. */
    @Input() d: string = '';
    /** 'clara' = sálvia (#A0B08B) sobre fundo claro; 'sobre-escuro' = creme (#F8F1EB) sobre foto/superfície escura. */
    @Input() variante: 'clara' | 'sobre-escuro' = 'clara';
    @Input() opacidade: number = 1;
    /** desenha = entrada em cascata (pof-desenha); percorre = loop do loader; nenhuma = estático. */
    @Input() animacao: 'desenha' | 'percorre' | 'nenhuma' = 'nenhuma';
    @Input() delayMs: number = 0;
    @Input() mobile: boolean = false;
}
