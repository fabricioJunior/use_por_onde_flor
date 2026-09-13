import { TestBed } from '@angular/core/testing';

import { PromocaoDto } from '../data/dtos/promocao.dto';
import { PromocaoPrecoService } from './promocao-preco.service';

describe('PromocaoPrecoService', () => {
  let service: PromocaoPrecoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromocaoPrecoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calcularFaixaParaCarrinho', () => {
    const promocaoLeve2: PromocaoDto = {
      id: 45,
      tipoDesconto: 'preco_fixo',
      tipoEscopo: 'faixa_quantidade',
      referenciaIds: [2147483729],
      faixas: [
        { quantidadeMinima: 1, valorDesconto: 39 },
        { quantidadeMinima: 2, valorDesconto: 29.5 },
      ],
    };

    it('não aplica desconto quando a quantidade não atinge a faixa de 2+', () => {
      const mapa = service.calcularFaixaParaCarrinho(
        [{ referenciaId: 2147483729, valor: 39, quantidade: 1 }],
        [promocaoLeve2],
      );
      expect(mapa.get(2147483729)?.valorFinal).toBe(39);
    });

    it('aplica preço fixo por unidade quando a soma da referência atinge a faixa', () => {
      const mapa = service.calcularFaixaParaCarrinho(
        [{ referenciaId: 2147483729, valor: 39, quantidade: 2 }],
        [promocaoLeve2],
      );
      expect(mapa.get(2147483729)?.valorFinal).toBe(29.5);
    });

    it('soma quantidade entre linhas diferentes da mesma referência (cores/tamanhos)', () => {
      const mapa = service.calcularFaixaParaCarrinho(
        [
          { referenciaId: 2147483729, valor: 39, quantidade: 1 },
          { referenciaId: 2147483729, valor: 39, quantidade: 1 },
        ],
        [promocaoLeve2],
      );
      expect(mapa.get(2147483729)?.valorFinal).toBe(29.5);
    });

    it('nunca aumenta o preço quando a faixa é maior que o valor base', () => {
      const promocaoRuim: PromocaoDto = {
        ...promocaoLeve2,
        faixas: [
          { quantidadeMinima: 1, valorDesconto: 39 },
          { quantidadeMinima: 2, valorDesconto: 50 },
        ],
      };
      const mapa = service.calcularFaixaParaCarrinho(
        [{ referenciaId: 2147483729, valor: 39, quantidade: 2 }],
        [promocaoRuim],
      );
      expect(mapa.get(2147483729)?.valorFinal).toBe(39);
    });
  });
});
