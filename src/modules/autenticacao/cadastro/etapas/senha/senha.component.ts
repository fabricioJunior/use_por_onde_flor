import { Component, OnInit, signal } from "@angular/core";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";
import { CadastroProgressoComponent } from "../../progresso/cadastro.progresso.component";
import { PofLoaderComponent } from "../../../../core/common_components/pof_loader/pof.loader.component";
import { CadastroComponent } from "../../cadastro.component";
import { Router } from "@angular/router";
import { AutenticacaoService } from "../../../services/autenticacao.service";
import { recuperarEmpresaAtual, resolverEmpresaId } from "../../../../../app/config/config.service";

@Component(
    {
        selector: 'senha-app',
        templateUrl: './senha.component.html',
        styleUrls: ['./senha.component.scss'],
        imports: [ReactiveFormsModule, FormsModule, FilledButtonComponent, CadastroProgressoComponent, PofLoaderComponent],
    }
)
export class SenhaComponent implements OnInit {


    formGroup: FormGroup;
    loading = signal(false);
    senhaError = signal('');
    avancaEnable = signal(false);
    private readonly empresaId = resolverEmpresaId(recuperarEmpresaAtual());


    constructor(private cadastroComponent: CadastroComponent, private router: Router, private loginService: AutenticacaoService) {
        this.formGroup = cadastroComponent.cadastroFromGroup;

        this.formGroup.get('senha')?.statusChanges.subscribe((value) => {
            this.atualizarSenhaError();
        });

        this.formGroup.get('aceitouRegulamento')?.valueChanges.subscribe(() => {
            this.atualizarSenhaError();
        });

        this.atualizarSenhaError();
    }

    ngOnInit(): void {
        if (!this.temDadosMinimosCadastroValidos()) {
            this.router.navigate(['/cadastro']);
        }
    }

    private temDadosMinimosCadastroValidos(): boolean {
        const nomeControl = this.formGroup.get('nome');
        const sobrenomeControl = this.formGroup.get('sobrenome');
        const telefoneControl = this.formGroup.get('telefone');
        const emailControl = this.formGroup.get('email');
        const cpfControl = this.formGroup.get('cpf');

        return !!nomeControl?.value
            && !!sobrenomeControl?.value
            && !!telefoneControl?.value
            && !!emailControl?.value
            && !!cpfControl?.value
            && !nomeControl.invalid
            && !sobrenomeControl.invalid
            && !telefoneControl.invalid
            && !emailControl.invalid
            && !cpfControl.invalid;
    }

    atualizarSenhaError() {
        var senhaInvalid = this.formGroup.get('senha')?.invalid;
        var aceitouRegulamento = this.formGroup.get('aceitouRegulamento')?.value === true;
        if (senhaInvalid || !aceitouRegulamento) {
            this.avancaEnable.set(false);
            this.senhaError.set(senhaInvalid ? 'Informe uma senha válida' : 'Você deve aceitar o regulamento do site');
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
            dataNascimento: this.formatDateFromParts(ano, mes, dia),
            telefone: this.formGroup.get('telefone')?.value,
            empresaId: this.empresaId,
        }).subscribe((value) => {
            this.loading.set(false);
            this.cadastroComponent.limparDraftCadastro();
            this.router.navigate(['/cadastro/fim']);
        });

    }

    abrirRegulamento() {
        this.router.navigate(['/regulamento']);
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

    formatDateFromParts(yearPart: any, monthPart: any, dayPart: any): string {
        const y = parseInt(String(yearPart ?? '').trim(), 10);
        const m = parseInt(String(monthPart ?? '').trim(), 10);
        const d = parseInt(String(dayPart ?? '').trim(), 10);

        if (isNaN(y) || isNaN(m) || isNaN(d)) {
            return '';
        }

        const dt = new Date(y, m - 1, d);
        const year = dt.getFullYear();
        let month = String(dt.getMonth() + 1);
        let day = String(dt.getDate());

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }



}