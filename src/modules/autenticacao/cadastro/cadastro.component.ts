import { Component, signal } from '@angular/core';
import { NomeComponent } from "./etapas/nome/nome.component";
import { LogoComponent } from "../../core/common_components/logo.component";
import { FilledButtonComponent } from "../../core/common_components/filled.button.component";
import { InformacoesBasicasComponent } from "./etapas/informacoes_basicas/informacoes.basicas.component";

@Component({
    selector: 'app-cadastro',
    templateUrl: './cadastro.component.html',
    styleUrls: ['./cadastro.component.scss'],
    imports: [NomeComponent, LogoComponent, FilledButtonComponent, InformacoesBasicasComponent]
})
export class CadastroComponent {
    etapa = signal(Etapas.Nome);

    onAvancarTap() {
        this.etapa.set(this.etapa() + 1);
    }
}

enum Etapas {
    Nome,
    InformacoesBasicas,
    InformacoesContato,
    Senha,
}