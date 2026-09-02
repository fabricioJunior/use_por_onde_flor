import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, signal } from "@angular/core";
import { Router } from "@angular/router";
import { CarrinhoFacadeService } from "../../../services/carrinho.facade.service";
import { CarrinhoItemViewDto } from "../../../data/dtos/carrinho-item-view.dto";
import { HeaderComponent } from "../../../../loja/presentation/components/header/header.component";
import { descricaoVariacao } from "../../../../loja/presentation/utils/variacao-apresentacao.util";
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";
import { TextButtonComponent } from "../../../../core/common_components/text.button.component";
import { PofLoaderComponent } from "../../../../core/common_components/pof_loader/pof.loader.component";
import { TracoComponent } from "../../../../core/common_components/traco/traco.component";

@Component({
    selector: 'carrinho-page',
    standalone: true,
    imports: [CommonModule, HeaderComponent, FilledButtonComponent, TextButtonComponent, PofLoaderComponent, TracoComponent],
    templateUrl: './carrinho.page.html',
    styleUrl: './carrinho.page.css',
})
export class CarrinhoPage implements OnInit {
    loading = signal(true);
    itens = signal<CarrinhoItemViewDto[]>([]);
    descricaoVariacao = descricaoVariacao;

    // Total ignora item indisponível (esgotado ou em pagamento) -- cliente vê o valor real do que
    // pode de fato comprar, sem precisar remover manualmente só pra ver o total certo.
    total = computed(() =>
        this.itens()
            .filter((item) => item.statusDisponibilidade === 'disponivel' || item.statusDisponibilidade == null)
            .reduce((soma, item) => soma + (item.valorPromocional ?? item.valor ?? 0) * (item.quantidade ?? 0), 0),
    );
    temItemIndisponivel = computed(() => this.itens().some((item) => item.statusDisponibilidade && item.statusDisponibilidade !== 'disponivel'));

    constructor(private carrinhoFacadeService: CarrinhoFacadeService, private router: Router) { }

    async ngOnInit(): Promise<void> {
        await this.carregar();
    }

    private async carregar(): Promise<void> {
        this.loading.set(true);
        try {
            this.itens.set(await this.carrinhoFacadeService.listar());
        } finally {
            this.loading.set(false);
        }
    }

    async alterarQuantidade(item: CarrinhoItemViewDto, quantidade: number): Promise<void> {
        if (quantidade < 1) {
            await this.remover(item);
            return;
        }
        const limite = item.quantidadeDisponivel ?? item.saldo ?? quantidade;
        await this.carrinhoFacadeService.adicionar(item.produtoId!, Math.min(quantidade, limite));
        await this.carregar();
    }

    async remover(item: CarrinhoItemViewDto): Promise<void> {
        await this.carrinhoFacadeService.remover(item.produtoId!);
        await this.carregar();
    }

    formatarPreco(valor: number | undefined): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    irParaCheckout(): void {
        this.router.navigate(['/checkout']);
    }

    irParaLoja = (): void => {
        this.router.navigate(['/loja']);
    };
}
