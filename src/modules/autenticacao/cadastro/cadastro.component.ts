import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { NomeComponent } from "./etapas/nome/nome.component";
import { LogoComponent } from "../../core/common_components/logo.component";
import { FilledButtonComponent } from "../../core/common_components/filled.button.component";
import { InformacoesBasicasComponent } from "./etapas/informacoes_basicas/informacoes.basicas.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavigationEnd } from '@angular/router';

import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { cpf } from 'cpf-cnpj-validator';

@Component({
    selector: 'app-cadastro',
    templateUrl: './cadastro.component.html',
    styleUrls: ['./cadastro.component.scss'],
    imports: [LogoComponent, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class CadastroComponent implements OnInit {

    cadastroFromGroup = new FormGroup(
        {
            nome: new FormControl('', [Validators.required, Validators.minLength(3)]),
            sobrenome: new FormControl('', [Validators.required, Validators.minLength(3)]),
            dia: new FormControl('', [Validators.required]),
            mes: new FormControl('', [Validators.required]),
            ano: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]),
            telefone: new FormControl('', [Validators.required, Validators.minLength(10)]),
            email: new FormControl('', [Validators.required, Validators.email]),
            cpf: new FormControl('', [Validators.required, Validators.minLength(11), cpfValidator()]),
            senha: new FormControl('', [Validators.required, Validators.minLength(6)]),
        }
    );

    constructor() {

    }

    ngOnInit(): void {

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