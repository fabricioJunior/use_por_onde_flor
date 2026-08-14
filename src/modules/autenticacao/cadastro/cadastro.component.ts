import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { NomeComponent } from "./etapas/nome/nome.component";
import { LogoComponent } from "../../core/common_components/logo.component";
import { FilledButtonComponent } from "../../core/common_components/filled.button.component";
import { InformacoesBasicasComponent } from "./etapas/informacoes_basicas/informacoes.basicas.component";
import { ActivatedRoute, NavigationStart, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { cpf } from 'cpf-cnpj-validator';
import { LocalStorageService } from '../../core/local_storage/local-storage.service';

@Component({
    selector: 'app-cadastro',
    templateUrl: './cadastro.component.html',
    styleUrls: ['./cadastro.component.scss'],
    imports: [LogoComponent, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class CadastroComponent implements OnInit, OnDestroy {

    private readonly cadastroDraftKey = 'cadastro_draft';
    private routerEventsSubscription?: Subscription;

    cadastroFromGroup = new FormGroup(
        {
            nome: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            sobrenome: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            dia: new FormControl(null, [Validators.required]),
            mes: new FormControl(null, [Validators.required]),
            ano: new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(4)]),
            telefone: new FormControl(null, [Validators.required, Validators.minLength(10)]),
            email: new FormControl(null, [Validators.required, Validators.email]),
            cpf: new FormControl(null, [Validators.required, Validators.minLength(11), cpfValidator()]),
            senha: new FormControl(null, [Validators.required, Validators.minLength(6)]),
            aceitouRegulamento: new FormControl(false, [Validators.requiredTrue]),
        }
    );

    // URL pra onde voltar após concluir cadastro + login (ex: veio do checkout).
    returnUrl = signal<string | null>(null);

    constructor(private localStorageService: LocalStorageService, private router: Router, private route: ActivatedRoute) {

    }

    ngOnInit(): void {
        this.returnUrl.set(this.route.snapshot.queryParamMap.get('returnUrl'));
        this.restaurarDraftCadastro();
        this.cadastroFromGroup.valueChanges.subscribe(() => {
            this.salvarDraftCadastro();
        });

        this.routerEventsSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart && !event.url.startsWith('/cadastro')) {
                this.limparDraftCadastro();
            }
        });
    }

    ngOnDestroy(): void {
        this.routerEventsSubscription?.unsubscribe();
    }

    limparDraftCadastro() {
        this.localStorageService.remove(this.cadastroDraftKey);
    }

    private salvarDraftCadastro() {
        this.localStorageService.set(this.cadastroDraftKey, this.cadastroFromGroup.getRawValue());
    }

    private restaurarDraftCadastro() {
        const draft = this.localStorageService.get<Record<string, unknown>>(this.cadastroDraftKey);
        if (!draft || typeof draft !== 'object') {
            return;
        }

        this.cadastroFromGroup.patchValue(draft, { emitEvent: false });
        this.cadastroFromGroup.updateValueAndValidity({ emitEvent: false });

    }

}

export function cpfValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const value = control.value as string


        var isValid = cpf.isValid(value);
        if (isValid) {
            return null;
        } else {
            return { invalidCpf: true };
        }

    }
}

enum Etapas {
    Nome,
    InformacoesBasicas,
    InformacoesContato,
    Senha,
}