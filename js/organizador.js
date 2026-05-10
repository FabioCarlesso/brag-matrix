// js/organizador.js
// Classificador local: separa o texto em itens e atribui cada um a uma
// categoria com base nas keywords definidas em js/categories/*.js.
// Tudo roda no browser — sem backend, sem chamadas externas, sem custo.

import { categorias } from "./categories/index.js";

const FALLBACK_PADRAO = "familia";

function normalizar(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Remove o prefixo de metadados que o WhatsApp adiciona quando você "Copia"
// uma mensagem ou exporta a conversa. Cobre as variações mais comuns:
//   [12:20, 10/05/2026] Fabio: texto
//   [10/05/2026, 12:20] Fabio: texto
//   12:20 - Fabio: texto
//   10/05/2026 12:20 - Fabio: texto
// Linhas sem esse prefixo passam intactas.
const WHATSAPP_PREFIX_RE = /^\s*\[?\s*(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s*[,;]\s*\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})?|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}(?:\s*[,;]?\s*\d{1,2}:\d{2}(?::\d{2})?)?)\s*\]?\s*[-–—]?\s*[^:\n]{1,80}:\s*/;

function removerMetadadosWhatsApp(linha) {
  return linha.replace(WHATSAPP_PREFIX_RE, "");
}

const BULLET_RE = /^\s*[-•*–—·>]+\s*/;

function limparPrefixos(linha) {
  // Bullet → WhatsApp → bullet de novo: cobre tanto "- [hora] Fab: x"
  // (bullet antes do prefixo) quanto "[hora] Fab: - x" (bullet dentro
  // do conteúdo do WhatsApp).
  return linha.replace(BULLET_RE, "").replace(WHATSAPP_PREFIX_RE, "").replace(BULLET_RE, "").trim();
}

function extrairItens(texto) {
  return String(texto || "")
    .split(/\r?\n+/)
    .map(limparPrefixos)
    .filter(Boolean);
}

function classificar(itemNormalizado, fallback) {
  let melhor = null;
  let melhorScore = 0;

  for (const cat of categorias) {
    const kws = Array.isArray(cat.keywords) ? cat.keywords : [];
    let score = 0;
    for (const kw of kws) {
      const k = normalizar(kw);
      if (!k) continue;
      const re = new RegExp(`(^|\\s)${escapeRegex(k)}(\\s|$)`);
      if (re.test(itemNormalizado)) {
        // Peso = nº de palavras na keyword. Frases mais específicas
        // (ex.: "almocei com") têm preferência sobre palavras isoladas.
        score += k.split(/\s+/).length;
      }
    }
    if (score > melhorScore) {
      melhorScore = score;
      melhor = cat.key;
    }
  }

  return melhor || fallback;
}

function montarSummary(itens, totalCategorias) {
  if (itens.length === 0) return "";
  const c = itens.length === 1 ? "conquista" : "conquistas";
  const k = totalCategorias === 1 ? "categoria" : "categorias";
  return `${itens.length} ${c} em ${totalCategorias} ${k} hoje ✨`;
}

export function organizar(texto, dataISO, opcoes = {}) {
  const fallback = opcoes.fallback || FALLBACK_PADRAO;
  const out = { date: dataISO, summary: "" };
  for (const cat of categorias) out[cat.key] = [];

  const itens = extrairItens(texto);
  for (const item of itens) {
    const norm = normalizar(item);
    const catKey = classificar(norm, fallback);
    if (!out[catKey]) out[catKey] = [];
    out[catKey].push(item);
  }

  const totalCategorias = categorias.filter(c => (out[c.key] || []).length > 0).length;
  out.summary = montarSummary(itens, totalCategorias);
  return out;
}
