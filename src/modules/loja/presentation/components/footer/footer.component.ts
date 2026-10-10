import { CommonModule } from "@angular/common";
import { Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LogoComponent } from "../../../../core/common_components/logo.component";
import { LOJA_CONFIG } from "../../../config/loja.config";

// Newsletter (1.7) + rodapé (1.8) + botão flutuante de WhatsApp (1.9). Vem junto porque é o mesmo
// "pé" em todas as telas da loja. Links/redes vêm de `loja.config.ts` -- o backend não tem menu
// institucional, e bloco sem fonte (newsletter, WhatsApp sem número) nasce desligado.
@Component({
    selector: 'loja-footer',
    standalone: true,
    imports: [CommonModule, RouterLink, LogoComponent],
    templateUrl: './footer.component.html',
    styleUrls: ['../../loja.shared.css', './footer.component.css'],
})
export class FooterComponent {
    config = LOJA_CONFIG;
    ano = new Date().getFullYear();

    /** Índice da coluna aberta no acordeão mobile. */
    aberto = signal<number | null>(null);

    redesAtivas = this.config.redes.filter((r) => !!r.url);

    alternar(indice: number): void {
        this.aberto.update((atual) => (atual === indice ? null : indice));
    }

    whatsappUrl(): string | null {
        const { numero, mensagem } = this.config.whatsapp;
        return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}` : null;
    }
}
