import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from "@angular/core";
import { LogoComponent } from "../../../../core/common_components/logo.component";
import { PontoComponent } from "../../components/ponto/ponto.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { PontosService } from "../../services/pontos.service";
import { PontoDto } from "../../data/dto/ponto.dto";
import { PontosDto } from "../../data/dto/pontos.dto";
import { PofLoaderComponent } from "../../../../core/common_components/pof_loader/pof.loader.component";
import { UsuarioDto } from "../../../../autenticacao/data/dto/usuario.dto";
import { Router } from "@angular/router";
import { TextButtonComponent } from "../../../../core/common_components/text.button.component";

@Component(
    {
        selector: 'pontos-page',
        templateUrl: './pontos.component.html',
        styleUrls: ['./pontos.component.scss'],
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: true,
        imports: [LogoComponent, PontoComponent, MatIconModule, MatButtonModule, PofLoaderComponent, TextButtonComponent],
    }
)
export class PontosComponent implements OnInit {
    totalDePontos = signal(0);

    historicoDePontos = signal<PontosDto | null>(null);
    pessoa = signal<UsuarioDto | null>(null);
    exibirCupomLiveHoje = this.isDiaDoCupomLive();


    async carregarPontos() {
        this.historicoDePontos.set(await this.pontosService.recuperarPontos());
    }
    async carregarPessoa() {
        this.pessoa.set(await this.pontosService.recuperarUsuario());
    }

    voltarParaSite() {
        this.router.navigate(['/loja']);
    }

    onRegulamentoTap = () => {
        this.router.navigate(['/regulamento']);
    };

    private isDiaDoCupomLive(): boolean {
        const hoje = new Date();
        const dia = hoje.getDate();
        const mes = hoje.getMonth() + 1;
        const ano = hoje.getFullYear();

        return dia === 28 && mes === 2 && ano === 2026;
    }

    constructor(private pontosService: PontosService, private router: Router) {

    }

    ngOnInit(): void {
        this.carregarPessoa();
        this.carregarPontos();
    }
} 