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
