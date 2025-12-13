import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from "@angular/core";
import { LogoComponent } from "../../../../core/common_components/logo.component";
import { PontoComponent } from "../../components/ponto/ponto.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { PontosService } from "../../services/pontos.service";
import { PontoDto } from "../../data/dto/ponto.dto";
import { PontosDto } from "../../data/dto/pontos.dto";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { UsuarioDto } from "../../../../autenticacao/data/dto/usuario.dto";

@Component(
    {
        selector: 'pontos-page',
        templateUrl: './pontos.component.html',
        styleUrls: ['./pontos.component.scss'],
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: true,
        imports: [LogoComponent, PontoComponent, MatIconModule, MatButtonModule, MatProgressSpinner],
    }
)
export class PontosComponent implements OnInit {
    totalDePontos = signal(0);

    historicoDePontos = signal<PontosDto | null>(null);
    pessoa = signal<UsuarioDto | null>(null);


    async carregarPontos() {
        this.historicoDePontos.set(await this.pontosService.recuperarPontos());
    }
    async carregarPessoa() {
        this.pessoa.set(await this.pontosService.recuperarUsuario());
    }

    constructor(private pontosService: PontosService) {

    }

    ngOnInit(): void {
        this.carregarPessoa();
        this.carregarPontos();
    }
} 