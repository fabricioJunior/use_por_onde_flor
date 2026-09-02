import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AutenticacaoService } from "../../../../autenticacao/services/autenticacao.service";
import { LocalStorageService } from "../../../../core/local_storage/local-storage.service";
import { UsuarioDto } from "../../../../autenticacao/data/dto/usuario.dto";
import { LogoComponent } from "../../../../core/common_components/logo.component";
import { TracoComponent } from "../../../../core/common_components/traco/traco.component";

// Porta Angular de `desing system/ui_kits/site/Header.jsx`.
@Component({
    selector: 'loja-header',
    standalone: true,
    imports: [CommonModule, RouterLink, LogoComponent, TracoComponent],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent {
    @Input() itensNoCarrinho = 0;

    constructor(private autenticacaoService: AutenticacaoService, private localStorageService: LocalStorageService, public router: Router) { }

    estaAutenticado(): boolean {
        return this.autenticacaoService.estaAutenticado();
    }

    nomeDoUsuario(): string {
        const usuario = this.localStorageService.get<UsuarioDto>('usuario_da_sessao');
        if (!usuario) return '';
        return [usuario.nome, usuario.sobrenome].filter(Boolean).join(' ');
    }

    logout(): void {
        this.autenticacaoService.logout();
        this.router.navigate(['/loja']);
    }
}
