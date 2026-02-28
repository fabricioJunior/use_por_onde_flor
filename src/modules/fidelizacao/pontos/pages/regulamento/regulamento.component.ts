import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: 'regulamento-page',
    templateUrl: './regulamento.component.html',
    styleUrls: ['./regulamento.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule],
})
export class RegulamentoComponent {
    constructor(private location: Location) {
    }

    voltar() {
        this.location.back();
    }
}
