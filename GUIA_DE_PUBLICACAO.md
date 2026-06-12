# Guia de Publicação — GitHub Pages

## 1. Limpar o repositório

Antes de subir esta versão, apague do GitHub todos os arquivos antigos que pertenciam ao React/Vite:

```text
package.json
package-lock.json
node_modules/
dist/
vite.config.js
vercel.json
src/
.github/workflows/
App.jsx
main.jsx
components/
style.css
styles.css
script.js
cases.js
```

O repositório deve ficar limpo para não misturar versões.

## 2. Subir a versão nova

Extraia o ZIP e suba para a raiz do repositório:

```text
index.html
README.md
GUIA_DE_PUBLICACAO.md
assets/
```

A pasta `assets` precisa subir inteira.

## 3. Configurar GitHub Pages

No GitHub:

```text
Settings > Pages
```

Configure:

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

Clique em Save.

## 4. Aguardar publicação

Aguarde alguns minutos.

A URL ficará parecida com:

```text
https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
```

## 5. Quando atualizar o site

Para atualizar textos ou imagens, altere os arquivos e faça commit.

Não precisa rodar build.

## 6. Não usar Vercel agora

Esta versão foi feita para GitHub Pages.

Vercel pode ser usado depois, mas não é necessário.
