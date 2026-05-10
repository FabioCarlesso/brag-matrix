# 🚀 Brag Matrix — Guia de Deploy

Tudo que você precisa fazer para colocar o sistema no ar em ~3 minutos. **Sem chave de API, sem backend, custo zero.**

---

## 📦 O que você está recebendo

Projeto completo, pronto para subir como site estático:

- Frontend HTML/CSS/JS puro (mobile-first)
- Classificação local por palavras-chave (sem IA externa)
- 7 categorias configuradas
- Histórico local no `localStorage`
- Testes automatizados
- Toda a documentação

---

## 🎯 Pré-requisitos

- Conta no GitHub
- Conta no Vercel, Netlify ou Cloudflare Pages — **gratuita** (qualquer uma serve)

> Não precisa mais de chave da Anthropic. A classificação roda inteiramente no navegador.

---

## 📋 Passo a passo (Vercel)

### 1️⃣ Subir o código no GitHub

```bash
git init
git add .
git commit -m "feat: initial commit - Brag Matrix"
```

Acesse https://github.com/new

- **Repository name:** `brag-matrix`
- **Public** ou **Private**, como preferir
- **NÃO** marque "Add README" (já existe)
- **Create repository**

Depois siga as instruções do GitHub para o `git push` inicial:

```bash
git remote add origin https://github.com/SEU-USUARIO/brag-matrix.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy no Vercel

1. Acesse https://vercel.com/new
2. **Import Git Repository** → selecione `brag-matrix`
3. **Framework Preset:** Other
4. **Root Directory:** `./`
5. Clique **Deploy**

Não há env vars para configurar.

Em ~20 segundos o Vercel devolve uma URL tipo:
`https://brag-matrix-seuusuario.vercel.app`

### 3️⃣ Testar

Abra a URL e cole um texto de teste:

```
Corri 5km hoje
Estudei inglês 30 min
Almocei com a Cah
Fechei o PR do projeto novo
```

Clique em **Organizar**. Deve aparecer cada item na sua categoria.

---

## 🌐 Outras opções de hospedagem (todas gratuitas)

### GitHub Pages
- Settings → Pages → Source: `main` → `/root` → Save.
- O `.nojekyll` já está no projeto.

### Netlify
- "Add new site" → "Import from Git" → escolha o repo.
- Build command: vazio. Publish directory: `.`

### Cloudflare Pages
- "Create a project" → conecte o repo.
- Build command: vazio. Build output directory: `.`

### Local sem deploy
Qualquer servidor estático serve:

```bash
npm run dev          # usa npx serve
# ou
python3 -m http.server 3000
```

---

## 📱 Adicionar atalho na tela inicial do celular

**iPhone (Safari):**
1. Abra a URL
2. ⬆️ → **Adicionar à Tela de Início**

**Android (Chrome):**
1. Abra a URL
2. Menu (⋮) → **Adicionar à tela inicial**

Vira um "app" com ícone próprio.

---

## 🔄 Atualizar depois

Push para `main` → deploy automático em qualquer um dos serviços acima.

```bash
git add .
git commit -m "feat: novas keywords em saúde"
git push
```

---

## 🧪 Rodar testes

```bash
npm test
```

Cobre validação de categorias, classificação por keywords, histórico e formatação.

---

## ❓ Troubleshooting

**"Os módulos não carregam ao abrir o `index.html` direto"**
→ ES Modules exigem servidor HTTP. Use `npm run dev` em vez de abrir o arquivo no `file://`.

**"Categorizou um item na categoria errada"**
→ Adicione palavras-chave em `js/categories/<categoria>.js` (campo `keywords`). Quanto mais específica (frase com várias palavras), maior o peso.

**"Quero usar IA de verdade no futuro"**
→ A versão anterior com Anthropic Function continua disponível no histórico do Git. Para reativar, restaure `api/organizar.js` e `vercel.json` original; configure `ANTHROPIC_API_KEY` no Vercel.

---

## 💰 Custos

- **Hospedagem:** zero em qualquer um dos serviços listados (planos gratuitos cobrem uso pessoal).
- **API externa:** zero — a classificação é local.

---

## 🎉 Pronto!

Agora todo dia você:
1. Anota as conquistas no WhatsApp
2. Abre o **Brag Matrix** no celular
3. Cola, organiza, copia
4. Cola no seu Google Docs

Bom uso! 🚀
