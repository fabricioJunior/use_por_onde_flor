import { TestBed } from '@angular/core/testing';

import { VitrineMenuItemDto } from '../data/dtos/vitrine.dto';
import { LOJA_CONFIG } from '../config/loja.config';
import { MenuVitrineService } from './menu.vitrine.service';
import { parcelas, progressoFreteGratis, textoParcelamento } from './preco.apresentacao.util';

const lista = (id: number, nome: string | null, ordem: number, icone: string | null = null): VitrineMenuItemDto =>
  ({ tipo: 'lista', id, nome, descricao: null, icone, ordem });

describe('MenuVitrineService', () => {
  let service: MenuVitrineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuVitrineService);
  });

  it('respeita a ordem do admin e aponta lista pra /loja/lista/:id', () => {
    const menu = service.montar([lista(7, 'Jeans', 2), lista(3, 'Novidades', 1)]);

    expect(menu.map((i) => i.label)).toEqual(['Novidades', 'Jeans']);
    expect(menu[0].rota).toEqual(['/loja/lista', '3']);
    expect(menu[0].filhos).toEqual([]);
  });

  it('transforma as listas do grupo nas colunas do mega-menu, ordenadas', () => {
    const menu = service.montar([
      {
        tipo: 'grupo', id: 10, nome: 'Roupas', descricao: null, icone: 'https://cdn/roupas.png', ordem: 1,
        listas: [
          { id: 22, nome: 'Partes de baixo', descricao: null, icone: null, ordem: 2 },
          { id: 21, nome: 'Partes de cima', descricao: null, icone: null, ordem: 1 },
        ],
      },
    ]);

    expect(menu[0].filhos.map((f) => f.label)).toEqual(['Partes de cima', 'Partes de baixo']);
    expect(menu[0].imagem).toBe('https://cdn/roupas.png');
    // Grupo não tem página própria: "ver tudo" cai na primeira lista dele.
    expect(menu[0].rota).toEqual(['/loja/lista', '21']);
  });

  it('grupo sem lista vira link direto sem mega-menu, e item sem nome é descartado', () => {
    const menu = service.montar([
      { tipo: 'grupo', id: 11, nome: 'Vazio', descricao: null, icone: null, ordem: 1, listas: [] },
      lista(12, '   ', 2),
      lista(13, null, 3),
    ]);

    expect(menu.length).toBe(1);
    expect(menu[0].filhos).toEqual([]);
    expect(menu[0].rota).toEqual(['/loja']);
  });

  it('marca destaque (bordô) por palavra-chave do nome da lista', () => {
    const menu = service.montar([lista(1, 'Sale', 1), lista(2, 'Promoção', 2), lista(3, 'Kits', 3)]);
    expect(menu.map((i) => i.destaque)).toEqual([true, true, false]);
  });
});

describe('preco.apresentacao.util', () => {
  it('não mostra parcelamento nem frete grátis enquanto a regra não vem do backend', () => {
    expect(LOJA_CONFIG.parcelamento.ativo).toBeFalse();
    expect(textoParcelamento(300)).toBeNull();
    expect(parcelas(300)).toEqual([]);
    expect(progressoFreteGratis(100)).toBeNull();
  });

  it('calcula N = min(max, preço/mínimo) quando o parcelamento está ligado', () => {
    const original = { ...LOJA_CONFIG.parcelamento };
    Object.assign(LOJA_CONFIG.parcelamento, { ativo: true, maxParcelas: 6, valorMinimoParcela: 20 });
    try {
      expect(textoParcelamento(300)).toContain('6x');
      expect(textoParcelamento(60)).toContain('3x');
      // Abaixo de 2 parcelas não faz sentido anunciar parcelamento.
      expect(textoParcelamento(30)).toBeNull();
      expect(parcelas(60).length).toBe(3);
    } finally {
      Object.assign(LOJA_CONFIG.parcelamento, original);
    }
  });

  it('calcula falta/percentual do frete grátis quando a regra está ligada', () => {
    const original = { ...LOJA_CONFIG.freteGratis };
    Object.assign(LOJA_CONFIG.freteGratis, { ativo: true, minimo: 400 });
    try {
      expect(progressoFreteGratis(100)).toEqual({ falta: 300, percentual: 25 });
      expect(progressoFreteGratis(500)).toEqual({ falta: 0, percentual: 100 });
    } finally {
      Object.assign(LOJA_CONFIG.freteGratis, original);
    }
  });
});
