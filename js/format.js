// js/format.js
// Regras compartilhadas de formatação das conquistas.

import { categorias } from "./categories/index.js";

export function listarConquistasFormatadas(organizado) {
  const linhas = [];

  categorias.forEach(cat => {
    const itens = (organizado?.[cat.key] || []).filter(item => item && item.trim());
    itens.forEach(item => linhas.push(`${cat.label} - ${item.trim()}`));
  });

  return linhas;
}
