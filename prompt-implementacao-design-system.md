# Prompt para agente de implementação — Design System Por Onde Flor

Implemente o design system da marca **Por Onde Flor** no site institucional existente, usando os arquivos do zip anexado como fonte da verdade. Siga exatamente as especificações abaixo — não invente cores, fontes ou espaçamentos novos.

## 1. Fundação (tokens)
Importe os arquivos de `tokens/` (via `styles.css`, que já os agrega):
- `tokens/colors.css` — paleta de marca (verde extraído da logo, `--brand-primary` / `--brand-primary-deep`) e neutros quentes (`--color-neutral-*`), com aliases semânticos (`--surface-*`, `--text-*`, `--border-*`, `--link-color`).
- `tokens/typography.css` — fonte única **Montserrat** (Google Fonts), com escalas prontas (`--text-display`, `--text-h1`...`--text-h3`, `--text-body*`, `--text-eyebrow`, `--text-button`).
- `tokens/spacing.css` — escala de espaçamento em base 4px (`--space-1` a `--space-10`).
- `tokens/effects.css` — raios de borda, sombras suaves, easing/duração de transição.

Regra: todo estilo novo deve referenciar essas variáveis CSS — nunca hex/px hardcoded.

## 2. Logo
Use `assets/logo/logo-primary-color.png` como logo oficial. Área de proteção mínima: ¼ do diâmetro da logo livre ao redor. Tamanho mínimo 32px em tela. Não recolorir, distorcer ou adicionar sombra/contorno.

## 3. Componentes
Implemente os componentes de `components/` exatamente como especificado (cada um tem `.jsx` fonte + `.d.ts` com a interface + `.prompt.md` com exemplo de uso):
- `core/`: Button (variants primary/secondary/ghost, sizes sm/md/lg), Badge, Tag, Card
- `forms/`: Input, Select, Checkbox, Radio, Switch
- `feedback/`: Toast, Tooltip
- `navigation/`: Tabs
- `overlays/`: Dialog

Todos usam estilo inline referenciando os tokens CSS — mantenha esse padrão ao integrar no código do site (não reescreva como classes CSS).

## 4. Telas de referência
`ui_kits/site/` contém a home institucional já montada (`index.html`, com fontes separadas em `Header.jsx`, `Hero.jsx`, `ProductGrid.jsx`, `Footer.jsx`) — use como referência de composição (grid de produtos, header com sacola, footer com newsletter) ao integrar no site real.

Versão atual do hero (referência de conteúdo/estilo):
- Logo nova no header (`assets/logo/logo-primary-color.png`) — círculo verde sólido #709274 com texto script branco.
- Título: "Peças atemporais para o dia a dia" em `--brand-primary` (verde da logo).
- Subtítulo: "Para mulheres que vivem o básico com estilo" em `--brand-primary-deep`.
- Palavras-chave em negrito verde: Atemporal · Jeans · Casual · Elegante.
- Botão "Ver coleção" com fundo `--brand-primary-deep`.
- Sem eyebrow ("Coleção atual" foi removido).

## 5. Tom de voz e conteúdo
Ver `readme.md` na raiz do zip — seção "Content fundamentals": tom sóbrio e direto, sem gírias/exclamações/emoji, público 26+ de maior renda. Vocabulário: atemporal, essencial, básico, elegante, curadoria.

## 6. Entregável esperado
Substitua os componentes visuais do site atual pelos equivalentes acima, aplicando os tokens de cor/tipografia/espaçamento globalmente (não só nas telas novas). Ao final, o site deve usar exclusivamente a paleta e a fonte Montserrat definidas aqui, com os componentes de UI padronizados.
