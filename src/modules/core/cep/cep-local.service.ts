import { Injectable, inject, signal } from '@angular/core';

import { LocalStorageService } from '../local_storage/local-storage.service';

const CHAVE = 'cep_frete';

// CEP do visitante guardado no navegador (só dígitos, 8) -- base pro cálculo de frete na PDP e no
// checkout. `detectarPorLocalizacao` preenche a partir da geolocalização do browser.
@Injectable({ providedIn: 'root' })
export class CepLocalService {
    private storage = inject(LocalStorageService);

    readonly cep = signal<string>(this.ler());

    salvar(cep: string): void {
        const digitos = cep.replace(/\D/g, '');
        if (digitos.length !== 8) {
            return;
        }
        this.cep.set(digitos);
        void this.storage.set(CHAVE, digitos);
    }

    // Geolocalização -> CEP via Nominatim (OpenStreetMap, sem chave). Devolve null se o usuário
    // negar a permissão ou se o ponto não tiver CEP completo no mapa -- aí ele digita.
    // ponytail: Nominatim nem sempre traz o CEP de 8 dígitos; upgrade = ViaCEP por logradouro.
    async detectarPorLocalizacao(): Promise<string | null> {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            return null;
        }
        try {
            const pos = await new Promise<GeolocationPosition>((ok, erro) =>
                navigator.geolocation.getCurrentPosition(ok, erro, { timeout: 10000, maximumAge: 600000 }),
            );
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1`
                + `&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`;
            const resposta = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
            const dados = await resposta.json();
            const digitos = String(dados?.address?.postcode ?? '').replace(/\D/g, '');
            if (digitos.length !== 8) {
                return null;
            }
            this.salvar(digitos);
            return digitos;
        } catch {
            return null;
        }
    }

    private ler(): string {
        try {
            const valor = this.storage.get<string>(CHAVE);
            return typeof valor === 'string' && /^\d{8}$/.test(valor) ? valor : '';
        } catch {
            return '';
        }
    }
}
