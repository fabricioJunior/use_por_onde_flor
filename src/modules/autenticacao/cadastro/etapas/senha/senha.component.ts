import { Component, signal } from "@angular/core";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { NgxMaskDirective } from "ngx-mask";
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";
import { CadastroComponent } from "../../cadastro.component";
import { Router } from "@angular/router";
import { LoginService } from "../../../services/login.service";

@Component(
    {
        selector: 'senha-app',
        templateUrl: './senha.component.html',
        styleUrls: ['./senha.component.scss'],
        imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, MatSelectModule, FilledButtonComponent],
    }
)
export class SenhaComponent {


    formGroup: FormGroup;
    loading = signal(false);
    senhaError = signal('');
    avancaEnable = signal(false);


    constructor(cadastroComponent: CadastroComponent, private router: Router, private loginService: LoginService) {
        this.formGroup = cadastroComponent.cadastroFromGroup;

        this.formGroup.get('senha')?.statusChanges.subscribe((value) => {
            this.atualizarSenhaError();
        });
    }

    atualizarSenhaError() {
        var senhaInvalid = this.formGroup.get('senha')?.invalid;
        if (senhaInvalid) {
            this.avancaEnable.set(false);
            this.senhaError.set('Informe uma senha válida');
        } else {
            this.avancaEnable.set(true);
            this.senhaError.set('');
        }
    }

    onAvancarTap() {
        this.loading.set(true);
        var ano = this.formGroup.get('ano')?.value;
        var mes = this.formGroup.get('mes')?.value;
        var dia = this.formGroup.get('dia')?.value;
        this.loginService.criarUsuario({
            email: this.formGroup.get('email')?.value,
            nome: this.formGroup.get('nome')?.value,
            sobrenome: this.formGroup.get('sobrenome')?.value,
            senha: this.formGroup.get('senha')?.value,
            documento: this.formGroup.get('cpf')?.value,
            dataNascimento: this.formatDate(`${ano}-${mes}-${dia}`),
            telefone: this.formGroup.get('telefone')?.value

        }).subscribe((value) => {
            this.loading.set(false);
            this.router.navigate(['/cadastro', { outlets: { cadastroOutlet: ['fim'] } }]);
        });

    }

    formatDate(date: string): string {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }



}