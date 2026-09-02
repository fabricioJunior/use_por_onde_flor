import { Component, Input } from "@angular/core";
import { LogoComponent } from "../logo.component";

/**
 * Substitui todo mat-spinner do site. Traço percorrendo o próprio desenho.
 */
@Component({
    selector: 'app-pof-loader',
    templateUrl: './pof.loader.component.html',
    styleUrls: ['./pof.loader.component.css'],
    imports: [LogoComponent],
})
export class PofLoaderComponent {
    /** 'cheia' = overlay fullscreen sobre oliva escura com logo + texto. 'inline' = pequeno, dentro de botão. */
    @Input() variante: 'cheia' | 'inline' = 'inline';
    @Input() texto: string = 'Encontrando seu caminho';
}
