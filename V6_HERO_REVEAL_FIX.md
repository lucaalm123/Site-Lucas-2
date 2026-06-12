# V6 — Hero clean + reveal failsafe

## O que foi corrigido

1. Removi a moldura/borda grande atrás da imagem principal do Hero.
2. Mantive apenas os documentos como protagonistas visuais.
3. Suavizei as miniaturas laterais.
4. Adicionei um sistema de segurança no JavaScript para revelar todos os blocos animados caso o observer falhe.
5. Isso ajuda a corrigir o problema de:
   - imagens aparecendo só em alguns blocos;
   - contato sumindo;
   - seções intercaladas invisíveis.

## Arquivos alterados

- `assets/css/05-sections.css`
- `assets/js/effects.js`
