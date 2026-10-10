import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AutenticacaoService } from "../../../../autenticacao/services/autenticacao.service";
import { LocalStorageService } from "../../../../core/local_storage/local-storage.service";
import { UsuarioDto } from "../../../../autenticacao/data/dto/usuario.dto";
import { LogoComponent } from "../../../../core/common_components/logo.component";
import { LojaDataSource } from "../../../data/loja.data.source";
import { LOJA_CONFIG } from "../../../config/loja.config";
import { MenuItemVm, MenuVitrineService } from "../../../services/menu.vitrine.service";
import { SacolaService } from "../../../services/sacola.service";
import { SacolaDrawerComponent } from "../sacola_drawer/sacola.drawer.component";

// Chrome da loja (README 1.1 a 1.3 + 1.10): barra de campanha, header sticky desktop/mobile, menu
// dinâmico com mega-menu de 2 níveis, drawer mobile em níveis e a sacola (drawer compartilhado).
//
// Desktop e mobile são dois markups diferentes trocados por media query (820px) -- sem JS de
// resize, pra não quebrar no SSR.
@Component({
    selector: 'loja-header',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, LogoComponent, SacolaDrawerComponent],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
    config = LOJA_CONFIG;

    menu = signal<MenuItemVm[]>([]);
    megaAberto = signal<number | null>(null);

    drawerAberto = signal(false);
    /** Item cujo subnível está aberto no drawer mobile (null = nível 0). */
    nivel = signal<MenuItemVm | null>(null);

    busca = signal('');
    contador = signal<{ v: string; l: string }[]>([]);
    campanhaAtiva = signal(false);

    private timer?: ReturnType<typeof setInterval>;

    constructor(
        private autenticacaoService: AutenticacaoService,
        private localStorageService: LocalStorageService,
        private lojaDataSource: LojaDataSource,
        private menuService: MenuVitrineService,
        public sacola: SacolaService,
        public router: Router,
    ) { }

    async ngOnInit(): Promise<void> {
        void this.sacola.recarregar();
        this.iniciarCampanha();
        try {
            this.menu.set(this.menuService.montar(await firstValueFrom(this.lojaDataSource.vitrineMenu())));
        } catch (error) {
            // Loja sem vitrine configurada (ou API fora) fica sem nav, mas o header continua de pé.
            console.error('Erro ao carregar o menu da vitrine', error);
        }
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
    }

    // Barra de campanha só existe quando `campanha.ativo` E a data final ainda não passou -- sem
    // endpoint de campanha no backend, nasce desligada (ver loja.config.ts).
    private iniciarCampanha(): void {
        const { ativo, fimEm } = this.config.campanha;
        const fim = fimEm ? new Date(fimEm).getTime() : NaN;
        if (!ativo || Number.isNaN(fim)) {
            return;
        }
        const tick = () => {
            const restante = fim - Date.now();
            if (restante <= 0) {
                this.campanhaAtiva.set(false);
                clearInterval(this.timer);
                return;
            }
            const pad = (n: number) => String(n).padStart(2, '0');
            this.campanhaAtiva.set(true);
            this.contador.set([
                { v: pad(Math.floor(restante / 864e5)), l: 'd' },
                { v: pad(Math.floor(restante / 36e5) % 24), l: 'h' },
                { v: pad(Math.floor(restante / 6e4) % 60), l: 'm' },
                { v: pad(Math.floor(restante / 1e3) % 60), l: 's' },
            ]);
        };
        tick();
        this.timer = setInterval(tick, 1000);
    }

    estaAutenticado(): boolean {
        return this.autenticacaoService.estaAutenticado();
    }

    nomeDoUsuario(): string {
        const usuario = this.localStorageService.get<UsuarioDto>('usuario_da_sessao');
        return usuario ? [usuario.nome, usuario.sobrenome].filter(Boolean).join(' ') : '';
    }

    logout(): void {
        this.autenticacaoService.logout();
        this.router.navigate(['/loja']);
    }

    buscar(): void {
        const termo = this.busca().trim();
        this.fecharDrawer();
        this.router.navigate(['/loja'], { queryParams: termo ? { q: termo } : {} });
    }

    abrirMega(item: MenuItemVm): void {
        this.megaAberto.set(item.filhos.length ? item.id : null);
    }

    fecharMega(): void {
        this.megaAberto.set(null);
    }

    itemMegaAberto(): MenuItemVm | undefined {
        const id = this.megaAberto();
        return id == null ? undefined : this.menu().find((i) => i.id === id);
    }

    abrirDrawer(): void {
        this.drawerAberto.set(true);
    }

    // Volta pro nível 0 só depois da animação de saída (350ms), igual ao mock.
    fecharDrawer(): void {
        this.drawerAberto.set(false);
        setTimeout(() => this.nivel.set(null), 350);
    }

    entrarNoNivel(item: MenuItemVm): void {
        this.nivel.set(item);
    }

    voltarNivel(): void {
        this.nivel.set(null);
    }

    whatsappUrl(): string | null {
        const { numero, mensagem } = this.config.whatsapp;
        return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}` : null;
    }
}
