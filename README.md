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
