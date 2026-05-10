// js/categories/index.js
// Registro central das categorias. Para adicionar uma nova:
// 1. Crie o arquivo em js/categories/nome.js seguindo o padrão.
// 2. Importe e adicione no array abaixo.

import { saude } from "./saude.js";
import { familia } from "./familia.js";
import { espiritual } from "./espiritual.js";
import { estudo } from "./estudo.js";
import { lazer } from "./lazer.js";
import { profissional } from "./profissional.js";
import { financeiro } from "./financeiro.js";

export const categorias = [
  saude,
  familia,
  espiritual,
  estudo,
  lazer,
  profissional,
  financeiro
];

// Validação: chaves duplicadas interrompem o carregamento
const chaves = new Set();
for (const cat of categorias) {
  if (chaves.has(cat.key)) {
    throw new Error(`Categoria duplicada: "${cat.key}"`);
  }
  chaves.add(cat.key);
}
