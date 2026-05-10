# Brag Matrix

Sistema pessoal de registro e organização de conquistas diárias.

Você cola anotações livres do WhatsApp, o app classifica automaticamente em 7 áreas da vida usando palavras-chave, você revisa e copia formatado para o seu Brag Document.

**Custo zero, sem backend, sem chave de API.** Toda a lógica roda no navegador.

## Como usar

1. Acesse https://fabiocarlesso.github.io/brag-matrix/ pelo navegador (celular ou desktop).
2. Cole o texto bruto das suas conquistas do dia (limite de 5000 caracteres). Cada linha vira um item.
3. Clique em **Organizar**.
4. Revise e edite o resultado por categoria.
5. Clique em **Copiar formatado**.
6. Cole no seu Google Docs.

Ao copiar ou salvar, cada conquista é registrada no formato `Categoria - Conquista`
(por exemplo, `Saúde - Corri 5km`).

## Categorias

| Categoria | Ícone | Descrição |
|---|---|---|
| Saúde | 🏃 | Exercícios, alimentação, bem-estar |
| Família / Amigos / Colegas | ❤️ | Relacionamentos e interações |
| Espiritual / Gratidão | 🙏 | Religião, meditação, reflexões |
| Estudo | 📚 | Aprendizado, cursos, leituras |
| Lazer | 🎮 | Diversão, descanso, hobbies |
| Profissional | 💼 | Trabalho e projetos |
| Financeiro | 💰 | Economia, investimentos |

Itens que não casam com nenhuma categoria caem em **Lazer** por padrão (configurável em `js/organizador.js`).

## Como funciona a classificação

Cada categoria em `js/categories/*.js` declara um array `keywords`. O organizador (`js/organizador.js`):

1. Quebra o texto por linhas, remove bullets (`-`, `•`, `*`, `>`...) e tira prefixos do WhatsApp (`[12:20, 10/05/2026] Fulano:` e variações).
2. Normaliza cada item (lowercase, sem acentos, sem pontuação).
3. Conta matches de keyword por categoria — palavras-chave **multi-palavra** (ex.: `"almocei com"`) valem mais do que palavras isoladas.
4. A categoria com maior pontuação ganha; sem matches → fallback (`lazer`).

Você pode colar conteúdo direto do "Copiar mensagem" do WhatsApp — o app limpa data/hora/remetente automaticamente.

Para melhorar a precisão, basta adicionar keywords nos arquivos de categoria.

## Setup local

```bash
git clone https://github.com/FabioCarlesso/brag-matrix
cd brag-matrix

# Servidor estático (instala on-demand via npx)
npm run dev
```

Acesse `http://localhost:3000`. Qualquer servidor de arquivos estáticos funciona — não há backend.

Alternativas: `python3 -m http.server 3000`, `php -S localhost:3000`, abrir o `index.html` direto (algumas funcionalidades de módulo ES podem exigir servidor HTTP).

## Deploy

Como é puro HTML/CSS/JS, dá pra hospedar em qualquer lugar gratuitamente:

- **GitHub Pages** — deploy automático pelo workflow `.github/workflows/pages.yml` a cada push na `main`. Configure Pages no GitHub para usar **GitHub Actions** como source. O `.nojekyll` já está no projeto.
- **Vercel** — `vercel --prod` ou conecte o repo no painel. Sem env vars necessárias.
- **Netlify** — drag-and-drop da pasta ou conecte o repo. Build command vazio, publish directory `.`.
- **Cloudflare Pages** — equivalente.

## Como adicionar novas categorias

Cada categoria é um arquivo em `js/categories/`:

```js
// js/categories/minha-categoria.js
export const minhaCategoria = {
  key: "minhaCategoria",        // chave única
  label: "Minha Categoria",      // exibido na UI
  icon: "✨",                    // emoji ou caractere curto
  color: "#a855f7",              // hex (#rrggbb), usado na borda/contagem
  description: "Descrição da categoria",
  keywords: ["palavra1", "frase com várias palavras", "outra"]
};
```

Depois registre em `js/categories/index.js`:

```js
import { minhaCategoria } from "./minha-categoria.js";

export const categorias = [
  // ... categorias existentes ...
  minhaCategoria
];
```

A categoria aparece automaticamente na interface e no organizador.

## Estrutura do projeto

```
brag-matrix/
├── index.html          # Página principal
├── .github/workflows/
│   └── pages.yml       # Deploy automático no GitHub Pages
├── vercel.json         # Configuração Vercel (estático)
├── package.json        # Scripts npm
├── .gitignore
├── .nojekyll
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js          # Lógica principal
│   ├── ui.js           # Manipulação do DOM
│   ├── organizador.js  # Classificação por keywords
│   ├── storage.js      # Histórico local (localStorage)
│   └── categories/
│       ├── index.js
│       ├── saude.js
│       ├── familia.js
│       ├── espiritual.js
│       ├── estudo.js
│       ├── lazer.js
│       ├── profissional.js
│       └── financeiro.js
│
└── test/
    ├── categories.test.js   # Validação das categorias
    ├── organizador.test.js  # Classificação por keywords
    ├── storage.test.js      # Histórico local
    └── format.test.js       # Formatação para o Docs
```

## Testes

```bash
npm test
```

Cobre validação das categorias, classificação por keywords (com fallback e peso multi-palavra), upsert/limite/remoção do histórico, e formatação de saída para o Google Docs.

## Tecnologias

- HTML, CSS e JavaScript puro (sem framework)
- ES Modules
- localStorage para histórico
- Zero dependências de runtime

## Licença

MIT
