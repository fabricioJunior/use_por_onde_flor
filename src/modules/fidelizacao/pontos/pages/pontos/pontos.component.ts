import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from "@angular/core";
import { LogoComponent } from "../../../../core/common_components/logo.component";
import { PontoComponent } from "../../components/ponto/ponto.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { PontosService } from "../../services/pontos.service";
import { PontoDto } from "../../data/dto/ponto.dto";

@Component(
    {
        selector: 'pontos-page',
        templateUrl: './pontos.component.html',
        styleUrls: ['./pontos.component.scss'],
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: true,
        imports: [LogoComponent, PontoComponent, MatIconModule, MatButtonModule,],
    }
)
export class PontosComponent implements OnInit {
    totalDePontos = signal(0);

    historicoDePontos = signal<PontoDto[]>([]);

    async carregarPontos() {
        this.historicoDePontos.set(await this.pontosService.recuperarPontos());
        this.totalDePontos.set(await this.pontosService.recuperarTotalPontos());
    }

    constructor(private pontosService: PontosService) {

    }

    ngOnInit(): void {
        this.carregarPontos();
    }
} 