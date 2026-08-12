import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AutenticacaoService } from "../../../../autenticacao/services/autenticacao.service";
import { LocalStorageService } from "../../../../core/local_storage/local-storage.service";
import { UsuarioDto } from "../../../../autenticacao/data/dto/usuario.dto";

// Porta Angular de `desing system/ui_kits/site/Header.jsx`.
@Component({
    selector: 'loja-header',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent {
    @Input() itensNoCarrinho = 0;

    constructor(private autenticacaoService: AutenticacaoService, private localStorageService: LocalStorageService) { }

    estaAutenticado(): boolean {
        return this.autenticacaoService.estaAutenticado();
    }

    nomeDoUsuario(): string {
        const usuario = this.localStorageService.get<UsuarioDto>('usuario_da_sessao');
        if (!usuario) return '';
        return [usuario.nome, usuario.sobrenome].filter(Boolean).join(' ');
    }
}
