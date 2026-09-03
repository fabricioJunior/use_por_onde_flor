# Por Onde Flor — Diretrizes de Marca

Rebrand de "Use Por Onde Flor" para **Por Onde Flor**, por Éllis Studio & Co. (2026-08-31).
Fonte: `Apresentação Por onde flor By Ellis.pdf`, `Logo/`, `Tipografia/` (raiz do projeto).
Estas diretrizes têm prioridade sobre qualquer decisão visual/de copy tomada antes do rebrand.

## Regra de ouro

Qualquer alteração de UI, copy institucional ou asset visual neste projeto **deve seguir estas
diretrizes**. Antes de escrever cor, fonte ou texto de marca "no olho", checar esta tabela.

## Nome

- **Nome correto: "Por Onde Flor"** (sem "Use"). Nunca reintroduzir "Use Por Onde Flor" em título,
  copy, e-mail transacional, meta tags etc.
- Wordmark visual: "POR ONDE FLOR" em caixa alta, com o "O" de "ONDE" formando um rabisco/linha
  contínua verde-sálvia que atravessa o texto (ver `Logo/`). Não recriar esse traço à mão — sempre
  usar os arquivos de logo oficiais.

## Paleta de cores

Fonte: página "Paleta Cromática" da apresentação, extraída pixel a pixel (não aproximada), mais o
prompt de identidade visual aplicado em 2026-09-01 (ver `desing system/tokens/colors.css`, plugado
no build real via `angular.json`). Verde é a cor dominante do site — bordô é exclusivamente texto
secundário/aviso/erro/pendência, nunca decoração ou fundo grande.

| Papel | Hex | Uso |
|---|---|---|
| Sálvia (primária) | `#A0B08B` | logo, bordas, linhas de campo, detalhes, badge |
| Oliva | `#6A755B` | ações primárias, seleção ativa, rótulos |
| Oliva escura | `#3E4636` | superfícies escuras — footer, painel de login/cadastro, hover de botão primário |
| Cru/Creme | `#F8F1EB` | fundo de todas as telas (substitui branco puro) |
| Bordô | `#6D4141` | exclusivamente texto secundário, avisos, erros, pendências |
| Café (quase-preto) | `#2B1919` | texto principal / logotipo "Preferencial" — usar como `--text-primary`, não preto puro |
| Superfície secundária | `#ECEDE3` | fundo de card, placeholder de foto, caixa de resumo (mistura cru + sálvia) |

Verde-carvão (`#25291F`) permanece nos tokens (`--color-green-900`) como tom mais escuro da escala,
mas não é mais a superfície escura padrão — esse papel passou pra Oliva escura acima.

Nunca usar preto puro (`#000000`) ou branco puro (`#FFFFFF`) como cor de texto/fundo principal —
a marca é sempre em tons quentes/off. Tokens semânticos (`--brand-primary`, `--brand-primary-hover`,
`--brand-primary-active`, `--brand-accent`, `--text-primary`, `--text-secondary`, `--surface-page`,
`--surface-secondary` etc.) já refletem isso — preferir sempre os tokens semânticos a hardcodar hex.

## Tipografia

- **Inter** (variável, pesos 100–900, self-hosted em `public/fonts/`, ver `desing system/tokens/typography.css`).
  Substituiu Montserrat/Roboto do site antigo.
- Arquivos-fonte originais ficam em `Tipografia/Inter/` (raiz) — não usar Google Fonts CDN para
  Inter neste projeto, os arquivos já estão no repo.
- Tom da marca: peso leve/regular para display e corpo de texto, sem itálico decorativo fora de
  citações (ver `--text-display`, `--text-h1` em `typography.css`, que usam peso 300–400).
- Nunca usar bold (700). Peso máximo no site inteiro é 500.

## Logo

- Fonte oficial: pasta `Logo/` na raiz — variantes RGB (uso digital) e CMYK (uso impresso), em
  Horizontal Uma Linha / Horizontal Duas Linhas / Vertical Três Linhas, cada uma em Preferencial
  (tinta + sálvia), Verde (monocromática sálvia) e Bordô (monocromática bordô), mais Positivo/Negativo
  pra fundos escuros/claros.
- Asset em uso no site: `public/logo-primary-color.png` (Preferencial, fundo claro) e
  `public/logo-negativo.png` (branco, fundo escuro), ambos variante Vertical Três Linhas. Ponto único
  de referência: `LogoComponent` (`core/common_components/logo.component.ts`), input `variante`
  (`'clara' | 'negativa'`) escolhe o asset, input `altura` controla o tamanho. Se precisar trocar de
  variante/formato, sempre copiar de `Logo/`, nunca recriar manualmente.
- Regra de contraste: `variante="clara"` (Preferencial, tinta+sálvia) sobre fundo claro/creme;
  `variante="negativa"` (branco) sobre fundo escuro/oliva-escura/bordô; nunca colorir o wordmark fora
  das variantes oficiais fornecidas.
- O traço sálvia da logo é o fio condutor visual do site inteiro — ver `TracoComponent`
  (`core/common_components/traco/`), SVG full-bleed reutilizável, usado em header/banner/vitrine/
  footer/login/cadastro como um caminho contínuo (cada trecho começa onde o anterior terminou).

## Conceito e tom de voz

- Posicionamento: "guarda-roupa inteligente" — moda casual com curadoria enxuta, básicos duráveis,
  peças versáteis que transitam do trabalho a ocasiões mais elegantes.
- Pilares: **Versatilidade, Qualidade, Estilo inteligente**.
- Tagline: "Combine. Recombine. Viva." e "Seu guarda-roupa mais inteligente."
- Tom: direto, sem jargão de moda vazio — foco em durabilidade/caimento/tecido, não em tendência.

## Ao alterar copy institucional

Sempre que mexer em textos institucionais (sobre, rodapé, meta description, e-mails
transacionais), checar se ainda cita "Use Por Onde Flor" e trocar para "Por Onde Flor".
