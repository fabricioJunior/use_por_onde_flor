Botão de ação padrão. Use `primary` para a ação principal de uma tela (ex: "Adicionar à sacola"), `secondary` para ações alternativas, `ghost` para ações terciárias/dentro de cards.

```jsx
<Button variant="primary" size="md">Adicionar à sacola</Button>
<Button variant="secondary">Ver detalhes</Button>
<Button variant="ghost" size="sm">Cancelar</Button>
```

Variantes: `primary | secondary | ghost`. Tamanhos: `sm | md | lg`. Suporta `icon` (nó React à esquerda do label) e `disabled`.
