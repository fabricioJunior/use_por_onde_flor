# Por Onde Flor — Design System

Marca de moda feminina. Estilo atemporal, básico e um pouco elegante. Público-alvo: mulheres a partir de ~26 anos, poder aquisitivo maior — tom deliberadamente **não jovial/infantil**.

**Fontes recebidas do usuário:**
- Logo oficial (PNG, versão colorida) — `assets/logo/logo-primary-color.png`. Usuário mencionou que também existe uma versão preto-e-branco, mas não foi enviada ainda.
- Cores extraídas diretamente da logo (ver Visual Foundations).
- Fonte oficial: **Montserrat** (Google Fonts), usada atualmente em posts e documentos da empresa.
- Sem componentes de UI pré-existentes — conjunto criado do zero para este sistema.

## ⚠ Nota sobre a logo

A logo atual usa uma tipografia cursiva/script bem lúdica e um verde-menta bastante saturado — isso comunica algo mais **fofo/artesanal/jovem** do que "atemporal, básico e elegante" para um público de maior renda 26+. Não alteramos a logo (é o ativo real da marca), mas registramos a sugestão: considerar, no futuro, uma **variante secundária** mais sóbria (ex: wordmark sem o círculo, em uma serifada fina ou na própria Montserrat light, sem o script), reservando a versão atual/script para redes sociais e embalagens onde o toque artesanal funciona bem. Este design system já compensa isso na base visual: usa o verde da logo apenas como **acento**, sobre uma fundação neutra e sóbria (bege/off-white, tipografia Montserrat limpa), para que o restante da marca (site, app, docs) leia como elegante mesmo com a logo atual.

## Content fundamentals

- **Tom de voz:** sóbrio, direto, sem gírias ou exclamações em excesso. Nada de emoji no corpo de texto. Frases curtas, declarativas — descreve peças e coleções sem hype.
- **Pessoa:** trata a cliente na 2ª pessoa (você), sem formalidade excessiva, mas sem intimidade juvenil.
- **Vocabulário:** atemporal, essencial, básico, elegante, curadoria — evitar palavras como "fofo", "trendy", "arrasa".
- **Pontuação:** minimalista; evitar "!!!" e caixa alta para ênfase.

## Visual foundations

- **Cores:** paleta neutra quente (off-white/bege, quase-preto) como base; o verde da logo (`--color-green-500` / `#58B098`) e seu tom profundo (`--color-green-700` / `#207068`) usados como acento — nunca como cor dominante de grandes áreas de texto corrido.
- **Tipografia:** Montserrat exclusivamente. Pesos leves (300/400) para títulos grandes — transmite elegância sem enfeite; 500/600 reservado a rótulos, botões, ênfase pontual.
- **Espaçamento:** generoso, respiro entre seções (escala em `tokens/spacing.css`), evita densidade — reforça a sensação premium.
- **Imagens:** full-bleed, fotografia de produto/still em fundo neutro; sem ilustração desenhada à mão. Placeholders listrados com legenda mono indicando o que deve entrar.
- **Cantos:** raios pequenos a médios (4–16px) em botões/cards; nenhum "pill" agressivo exceto em badges e tags.
- **Sombras:** suaves e discretas (`--shadow-sm/md/lg`), nunca duras ou coloridas.
- **Bordas:** finas (1px), tom neutro claro — nunca coloridas por padrão.
- **Hover/press:** hover = escurece levemente o acento (`--brand-primary-hover`); press = leve redução de opacidade/escala, sem cor extra.
- **Transparência/blur:** uso pontual em overlays de modal/dialog; não usado como estética decorativa.
- **Animação:** transições curtas e discretas (140–220ms, easing padrão), sem bounce/elastic — reforça o tom sóbrio.

## Iconography

Nenhum icon set foi fornecido pela marca. Usamos um conjunto de linha fina (stroke, sem preenchimento), neutro, via CDN (Lucide) — visualmente compatível com o tom sóbrio da marca. Nenhum emoji é usado na UI ou em copy.

## Índice

- `styles.css` — entry point (importa `tokens/`)
- `tokens/colors.css`, `typography.css`, `spacing.css`, `effects.css` — fundação
- `assets/logo/logo-primary-color.png` — logo oficial (versão colorida; P&B ainda não recebida)
- `guidelines/` — specimen cards (cores, tipografia, espaçamento, efeitos, uso da logo)
- `components/` — primitivos criados do zero (nenhum foi fornecido pela marca):
  - `core/` — Button, Badge, Tag, Card
  - `forms/` — Input, Select, Checkbox, Radio, Switch
  - `feedback/` — Toast, Tooltip
  - `navigation/` — Tabs
  - `overlays/` — Dialog
- `ui_kits/site/` — home do site institucional (header, hero, grade de produtos, footer) — interativo
- `ui_kits/app/` — app mobile: home → produto → sacola → perfil — interativo
- `ui_kits/social/` — templates de post/story para redes sociais (tamanho real de publicação)
- `ui_kits/docs/` — papel timbrado (carta/memo), usando `doc-page.js`
- `SKILL.md` — versão portátil para Claude Code

## Pendências / próximos passos

- Falta a versão preto-e-branco da logo (mencionada, não enviada).
- Nenhuma amostra de slides/apresentação foi criada: o processo pede um modelo de deck de referência antes de gerar slides de marca — envie um exemplo (ou peça para eu criar do zero) se quiser esse produto coberto.
- Considerar a variante de logo mais sóbria sugerida acima, para reforçar o posicionamento "atemporal e elegante" em todos os pontos de contato.
