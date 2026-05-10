// test/format.test.js
// Valida formatarParaDocs em datas válidas, inválidas e ausentes.

import { formatarParaDocs } from "../js/ui.js";

let falhas = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error("✗", msg);
    falhas++;
  } else {
    console.log("✓", msg);
  }
}

// Polyfill mínimo para document/window que ui.js não usa em formatarParaDocs.
// Como ui.js importa de categories/index.js (que é puro), o módulo carrega ok.

// 1. Data válida produz cabeçalho com dia/mês/ano
const out1 = formatarParaDocs({
  date: "2026-05-10",
  summary: "Dia produtivo",
  saude: ["Corri 5km"],
  familia: [],
  espiritual: [],
  estudo: [],
  lazer: [],
  profissional: [],
  financeiro: []
});
assert(out1.includes("10/05/2026"), "Data válida formatada como dd/mm/yyyy");
assert(out1.includes("Corri 5km"), "Item da categoria aparece na saída");
assert(out1.includes("💬 Dia produtivo"), "Summary aparece na saída");
assert(out1.includes("Saúde - Corri 5km"), "Conquista sai no formato Categoria - Conquista");
assert(!out1.includes("🏃 SAÚDE"), "Exportação não repete categoria como cabeçalho separado");

// 2. Data ausente NÃO gera "NaN/NaN/NaN"
const out2 = formatarParaDocs({
  summary: "",
  saude: ["x"],
  familia: [],
  espiritual: [],
  estudo: [],
  lazer: [],
  profissional: [],
  financeiro: []
});
assert(!out2.includes("NaN"), "Sem date, não gera NaN — usa fallback");

// 3. Data inválida também não gera NaN
const out3 = formatarParaDocs({
  date: "data-quebrada",
  summary: "",
  saude: [],
  familia: [],
  espiritual: [],
  estudo: [],
  lazer: [],
  profissional: [],
  financeiro: []
});
assert(!out3.includes("NaN"), "Date inválida não gera NaN");

// 4. Categorias vazias não aparecem
const out4 = formatarParaDocs({
  date: "2026-05-10",
  summary: "",
  saude: ["Item"],
  familia: [],
  espiritual: [],
  estudo: [],
  lazer: [],
  profissional: [],
  financeiro: []
});
assert(out4.includes("Saúde - Item"), "Categoria com item aparece no prefixo da conquista");
assert(!out4.includes("LAZER"), "Categoria vazia é omitida");

console.log(`\n${falhas === 0 ? "✓ Todos os testes de formatação passaram" : `✗ ${falhas} falha(s)`}`);
process.exit(falhas === 0 ? 0 : 1);
