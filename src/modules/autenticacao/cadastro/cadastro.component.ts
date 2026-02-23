import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { NomeComponent } from "./etapas/nome/nome.component";
import { LogoComponent } from "../../core/common_components/logo.component";
import { FilledButtonComponent } from "../../core/common_components/filled.button.component";
import { InformacoesBasicasComponent } from "./etapas/informacoes_basicas/informacoes.basicas.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavigationEnd } from '@angular/router';

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
export class CadastroComponent implements OnInit {

    private readonly cadastroDraftKey = 'cadastro_draft';

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
        }
    );

    constructor(private localStorageService: LocalStorageService) {

    }

    ngOnInit(): void {
        this.restaurarDraftCadastro();
        this.cadastroFromGroup.valueChanges.subscribe(() => {
            this.salvarDraftCadastro();
        });
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