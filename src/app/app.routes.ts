import { CanMatchFn, Route, Routes, UrlSegment, Router } from '@angular/router';
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
import { PagamentoStatusComponent } from '../modules/pagamento/presentation/pagamento_status/pagamento.status.component';
import { ProdutosComponent } from '../modules/produtos/presentation/produtos_page/produtos.component';
import { ProdutoComponent } from '../modules/produtos/presentation/produto_page/produto.component';
import { RenderMode } from '@angular/ssr';
import { PagamentosComponent } from '../modules/pagamento/presentation/pagamentos/pagamentos.component';
import { PagamentoComponent } from '../modules/pagamento/presentation/pagamento/pagamento.component';
import { RecuperarSenhaComponent } from '../modules/autenticacao/login/recuperar_senha/recuperar.senha.component';
import { MudarSenhaComponent } from '../modules/autenticacao/login/mudar_senha/mudar.senha.component';
import { AutenticacaoService } from '../modules/autenticacao/services/autenticacao.service';
import { inject } from '@angular/core';
import { RegulamentoComponent } from '../modules/fidelizacao/pontos/pages/regulamento/regulamento.component';


export const autenticacaoGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
    const authService = inject(AutenticacaoService);
    const router = inject(Router);

    const estaAutenticado = authService.estaAutenticado();
    if (!estaAutenticado) {
        router.navigate(['/login']);
        return false;
    }
    return true;
};

export const routes: Routes = [

    { path: 'acoes', component: AcoesComponent, },
    {
        path: 'login', component: LoginComponent, children: [

            {
                path: '', component: EmailComponent,
            },

            {
                path: 'stepSenha', component: LoginSenhaComponent,
            },
            {
                path: 'recuperarSenha', component: RecuperarSenhaComponent,
            }
        ]
    },
    {
        path: 'mudarSenha', component: MudarSenhaComponent,
    },
    {
        path: 'home', component: PontosComponent,
        canMatch: [autenticacaoGuard]

    },
    {
        path: 'regulamento', component: RegulamentoComponent,
    },
    {
        path: 'cadastro', component: CadastroComponent,
        children: [
            {
                path: '', component: NomeComponent,

            },
            {
                path: 'infoBasicas', component: InformacoesBasicasComponent,
            },
            {
                path: 'infoContato', component: InformacoesContatoComponent,
            },
            {
                path: 'senha', component: SenhaComponent,
            },
            {
                path: 'fim', component: FimComponent,
            },

        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    {
        path: 'pagamento', component: PagamentoStatusComponent, canMatch: [autenticacaoGuard]
    },
    {
        path: 'produtos', component: ProdutosComponent,

    },
    {
        path: 'produto/:referencia', component: ProdutoComponent,

    },
    {
        path: 'pagamentos', component: PagamentosComponent,
        canMatch: [autenticacaoGuard]
    },
    {
        path: 'pagamento/:orderNsu', component: PagamentoComponent,
        canMatch: [autenticacaoGuard]
    },


];

