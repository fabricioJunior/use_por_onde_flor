# Meta Pixel no site

Documentação completa (arquitetura, `event_id`, idempotência, configuração da Meta, validação no Events Manager e
troubleshooting): `apollo-api/docs/integracao-meta-conversoes.md`.

Resumo do lado do site:

- Todo `fbq` fica em `src/modules/core/meta-pixel/meta-pixel.service.ts` (`MetaPixelService`). Não chame `fbq` em
  componentes.
- Não há variável de ambiente nova nem campo na tela de e-commerce: o Pixel ID é configurado por empresa na tela "Integração Meta" do SIV, e o site pergunta ao backend (`GET v1/e-commerce/{id}/meta-pixel/config`) e só
  carrega o Pixel se `habilitado`. O token da Meta nunca chega ao site.
- Eventos e onde disparam: `PageView` (`AppComponent`, a cada navegação), `ViewContent` e `AddToCart`
  (`loja.referencia.page`; `AddToCart` também em `loja.home.page`/`loja.categoria.page`), `InitiateCheckout`
  (`checkout.page`), `Purchase` (`pedido.detalhe.page`, só com `?pago=1` + token e **se o backend confirmar** o pagamento;
  o `eventID` vem pronto do backend: `order_<id>`).
- O checkout envia `rastreio {fbp, fbc}` (cookies do Pixel) ao backend para casar o Purchase do servidor.
- O site não tem banner de consentimento; para respeitar um futuro aceite, chame `MetaPixelService.iniciar()` só depois dele.
- Testes: `npx ng test --watch=false --browsers=ChromeHeadless` (`meta-pixel.service.spec.ts`; nada chama a Meta).
