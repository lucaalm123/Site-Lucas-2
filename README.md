# V14 — Nimo Motion Rebuild

Refação completa focada em comportamento em movimento.

Inclui:
- olho nos cases seguindo o mouse;
- fumaça colorida no movimento do mouse;
- texto cinza preenchendo em branco conforme scroll;
- cards empilhando no scroll;
- cards empilhados com hover lime;
- roda/círculo lateral girando;
- timeline com linha preenchendo;
- partículas lime e grid contínuo;
- seções com fundo contínuo, sem divisões vermelhas.

Suba o conteúdo do ZIP na raiz do GitHub Pages.

Teste:
/CHECK_V14.html


## V14.1 Hotfix

- Smoke/fumaça agora fica em camada visível acima do fundo.
- Partículas ficam visíveis.
- Hero title ajustado para evitar corte.
- Página `CHECK_MOTION_V14_1.html` para testar fumaça, olho, fill text e hover lime.

## V15 — Refined Architecture

Correções principais:
- Fumaça reduzida e mais atmosférica.
- Remoção de pulso branco estourado.
- Redução de buracos entre seções.
- Scroll stack compacto e com cards empilhados desde o começo.
- Roda lateral substituída por símbolos curtos alinhados.
- Tipografia do Hero ajustada para não cortar palavras.
- Paleta mais controlada: lime principal, azul/magenta/âmbar apenas como atmosfera.


## V16 — Bugfix Smoke / Stack / Gap

Baseado no `effects.fixed.js` enviado pelo usuário.

Principais correções:
- fumaça agora cria canvas automaticamente se o HTML não tiver `#smoke-canvas`;
- fumaça em camada visível;
- redução de intensidade para não virar bola branca;
- cards Missão/Visão/Método separados, sem sobreposição ruim;
- scroll stack mais compacto;
- redução de buraco entre seções;
- proteção contra títulos/palavras cortadas.


## V17 — Aurora Smoke Nimo

A fumaça/rastro antigo foi substituído por um sistema de aurora atmosférica:
- `mouse-aurora-field`
- `aurora-smoke-layer`
- `aurora-smoke-blob`
- `premium-smoke-gradient`
- `initAuroraSmoke()`
- `updateAuroraSmoke()`
- `renderAuroraSmoke()`

Teste:
`CHECK_V17_AURORA.html`


## V18 — Nimo Fluid Aurora Trail

O zip do Nimo foi analisado. O efeito original é um canvas de fluido (`webgl-fluid`) configurado com:
- `TRIGGER: 'hover'`
- `TRANSPARENT: true`
- `DENSITY_DISSIPATION`
- `CURL`
- `SPLAT_RADIUS`

A V18 recria esse comportamento visual com Canvas 2D:
- `nimo-fluid-aurora-canvas`
- `nimo-fluid-aurora-trail`
- `initNimoFluidAurora()`
- `updateNimoFluidAurora()`
- `renderNimoFluidAurora()`

Teste:
`CHECK_V18_FLUID_AURORA.html`


## V19 — WebGL Fluid Smoke Nimo

Nova arquitetura do efeito:
- `assets/js/fluid-aurora-webgl.js`
- canvas `#nimo-webgl-fluid-canvas`
- feedback texture em WebGL
- splat + dissipação + noise/curl
- rastro fluido estilo fumaça/aurora

Teste:
`CHECK_V19_WEBGL_FLUID.html`


## V20 — Nimo Native Fluid Canvas

A V20 abandona a tentativa de recriar manualmente o efeito com Canvas 2D/shader simplificado.

Foi analisado o zip do Nimo e aplicado o mesmo padrão:
- canvas dentro do Hero;
- `webgl-fluid`;
- `TRIGGER: 'hover'`;
- `DENSITY_DISSIPATION: 10`;
- `CURL: 5`;
- `SPLAT_RADIUS: 0.3`;
- `TRANSPARENT: true`.

Arquivos:
- `assets/js/nimo-native-fluid.js`
- `CHECK_V20_NIMO_NATIVE.html`
- `_instrucoes/ANALISE_REAL_EFEITO_NIMO_V20.md`


## V21 — Full Site Nimo Polish

Correções principais:
- `#nimo-native-fluid-canvas` virou camada global fixa no site inteiro.
- `assets/js/nimo-native-fluid.js` mantém a lógica nativa do Nimo.
- `assets/js/v21-polish.js` adiciona letter FX, hero parallax, header polish, testimonial wheel e stack update.
- `assets/generated/testimonial-*.svg` são placeholders de fotos para depoimentos.
- Cases e portfólio foram refinados visualmente.
- Buracos grandes e cards fechados foram reduzidos.

Teste:
`CHECK_V21_FULL_SITE.html`


## V22 — Nimo Complete Rebuild

Esta versão reconstrói o `index.html` e usa CSS/JS novos:
- `assets/css/v22.css`
- `assets/js/v22.js`
- `assets/js/nimo-native-fluid.js`

Teste:
`CHECK_V22.html`


## V23 — Testimonial + Text Fix

Correções:
- `assets/js/v23.js` preserva palavras no efeito de letras.
- Side wheel agora exibe `VISUAL LAW` e `LEGAL DESIGN`.
- Depoimentos refeitos com arco amplo estilo Nimo.
- Placeholders de depoimentos melhorados.

Teste:
`CHECK_V23.html`


## V24 — DreamLab Clean Rebuild

Direção:
- estética DreamLab mais clean;
- sem roda de depoimentos/percepções;
- sem verde dominante;
- Nimo webgl-fluid global mantido;
- portfólio e serviços em linguagem de estúdio premium.

Teste:
`CHECK_V24.html`


## V25 — DreamLab B/W Project Showcase

- Base visual DreamLab preto/branco.
- Portfólio com lista minimalista, cubo rotativo e hover reveal.
- Método em cards tipo gaveta.
- Hero limpo e sem cortes de palavras.
- Nimo webgl-fluid global mantido.
- Sem roda de percepções.

Teste:
`CHECK_V25.html`


## V28 — Restore Black + Real Nimo Smoke

- Remove overlay/aurora fake que coloria o fundo inteiro.
- Fundo volta a ser preto.
- Fumaça vem apenas do Nimo webgl-fluid.
- Marquee usa palavras coloridas sem retângulos.
- Botões/ring/hovers têm cor pontual.

Teste:
`CHECK_V28.html`


## V29 — Black Background + Visible Real Nimo Smoke

- Fundo preto real.
- Sem aurora/overlay fake.
- Canvas Nimo acima do fundo e abaixo do conteúdo.
- Helper alimenta o canvas real com mouse e rastro inicial.
- Pressione `F` no CHECK para intensificar.


## V30 — V20 Nimo Smoke + Project Hover Fix

- `nimo-native-fluid.js` substituído pelo arquivo exato da V20.
- Canvas dentro do Hero, como na V20.
- Sem overlay/fumaça falsa.
- Projetos com imagem inline no hover.
- Cubo menor e sem grande vazio lateral.

Teste:
`CHECK_V30.html`


## V31 — Global V20 Nimo Smoke

- Efeito real da V20 agora fixo/global no site inteiro.
- Fundo preto, sem overlay/gradiente fake.
- Mouse alimenta o canvas em qualquer seção.
- Movimento inicial e idle discreto usando o próprio canvas real.
- Projetos/cubo da V30 preservados.

Teste:
`CHECK_V31.html`
