import { Routes } from '@angular/router';
import { AcoesComponent } from '../modules/acoes/acoes.component';
import { LoginComponent } from '../modules/autenticacao/login/login.component';
import { CadastroComponent } from '../modules/autenticacao/cadastro/cadastro.component';
import { EmailComponent } from '../modules/autenticacao/login/etapas/email/email.component';
import { LoginSenhaComponent } from '../modules/autenticacao/login/etapas/senha/senha.component';
import { NomeComponent } from '../modules/autenticacao/cadastro/etapas/nome/nome.component';
import { InformacoesBasicasComponent } from '../modules/autenticacao/cadastro/etapas/informacoes_basicas/informacoes.basicas.component';
import { InformacoesContatoComponent } from '../modules/autenticacao/cadastro/etapas/informacoes_contato/informacoes.contato.component';
import { SenhaComponent } from '../modules/autenticacao/cadastro/etapas/senha/senha.component';
import { FimComponent } from '../modules/autenticacao/cadastro/etapas/fim/fim.component';
import { PontosComponent } from '../modules/fidelizacao/pontos/pages/pontos/pontos.component';
import { PagamentoComponent } from '../modules/pagamento/presentation/pagamento/pagamento.component';

export const routes: Routes = [

    { path: 'acoes', component: AcoesComponent },
    {
        path: 'login', component: LoginComponent, children: [

            {
                path: '', component: EmailComponent, outlet: 'loginOutlet',
            },

            {
                path: 'stepSenha', component: LoginSenhaComponent, outlet: 'loginOutlet',
            }
        ]
    },
    {
        path: 'home', component: PontosComponent
    },
    {
        path: 'cadastro', component: CadastroComponent,
        children: [
            {
                path: '', component: NomeComponent, outlet: 'cadastroOutlet',

            },
            {
                path: 'infoBasicas', component: InformacoesBasicasComponent, outlet: 'cadastroOutlet',
            },
            {
                path: 'infoContato', component: InformacoesContatoComponent, outlet: 'cadastroOutlet',
            },
            {
                path: 'senha', component: SenhaComponent, outlet: 'cadastroOutlet'
            },
            {
                path: 'fim', component: FimComponent, outlet: 'cadastroOutlet'
            },

        ]
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'pagamento', component: PagamentoComponent
    }
];
