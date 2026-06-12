# Lucas Coimbra — Visual Law Studio

Versão estática premium do site, criada para publicação direta no GitHub Pages.

## Decisão técnica

Esta versão não usa React, Vite, npm, package-lock, node_modules, dist ou Vercel como dependência obrigatória.

A prioridade é estabilidade:

- sem build;
- sem erro de npm;
- sem erro de registry;
- sem import quebrado;
- sem cache do Vercel;
- publicação direta pelo GitHub Pages.

## Estrutura

```text
index.html
README.md
GUIA_DE_PUBLICACAO.md

assets/
  css/
    01-tokens.css
    02-base.css
    03-layout.css
    04-components.css
    05-sections.css
    06-effects.css
    07-responsive.css

  js/
    data.js
    utils.js
    menu.js
    cases.js
    effects.js
    main.js

  portfolio/
    ticket.png
    obramax.png
    procon.png
    contratos.png
    impugnacao.png
```

## Publicação

Suba todos os arquivos para a raiz do repositório.

No GitHub:

```text
Settings > Pages
Source: Deploy from a branch
Branch: main
Folder: /root
```

## Arquivos que devem ser apagados do repositório antes de subir

```text
package.json
package-lock.json
node_modules/
dist/
vite.config.js
vercel.json
src/
App.jsx
main.jsx
components/
.github/workflows/
```

## Editar textos dos cases

Edite:

```text
assets/js/data.js
```

## Formulário

No `index.html`, procure:

```html
<form action="https://formspree.io/f/SEU_ID_AQUI" method="POST">
```

Troque `SEU_ID_AQUI` pelo ID real do Formspree.

## Rodar localmente

Basta abrir o `index.html` no navegador.

Para testar de forma mais próxima ao GitHub Pages, use uma extensão como Live Server no VS Code.


## Correção V2 — imagens invisíveis

A V1 escondia elementos `.mask-reveal`, `.reveal` e `.split-lines` por padrão, esperando o JavaScript ativar a animação.

Se algum arquivo JS não carregasse no GitHub Pages, as imagens existiam no caminho certo, mas ficavam invisíveis.

A V2 corrige isso:
- elementos ficam visíveis por padrão;
- animação só ativa quando o JavaScript carrega;
- se o JS falhar, o site continua visível;
- foi adicionado `CHECK_IMAGENS.html` para testar as imagens diretamente.


## V4 Motion OK

Esta versão corrige o pipeline de animações. Use `CHECK_ANIMACOES.html` para verificar JS, reveal, mask reveal, cursor, hover 3D e parallax.
