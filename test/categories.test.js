// test/categories.test.js
// Valida que não há chaves duplicadas e que todas têm os campos obrigatórios.

import { categorias } from "../js/categories/index.js";

let falhas = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error("✗", msg);
    falhas++;
  } else {
    console.log("✓", msg);
  }
}

// Test 1: existe pelo menos uma categoria
assert(categorias.length > 0, "Há pelo menos uma categoria registrada");

// Test 2: chaves únicas
const chaves = new Set();
let temDup = false;
for (const cat of categorias) {
  if (chaves.has(cat.key)) temDup = true;
  chaves.add(cat.key);
}
assert(!temDup, "Não há chaves duplicadas entre as categorias");

// Test 3: campos obrigatórios em cada categoria
for (const cat of categorias) {
  assert(typeof cat.key === "string" && cat.key.length > 0, `Categoria "${cat.label || "?"}" tem key`);
  assert(typeof cat.label === "string" && cat.label.length > 0, `Categoria "${cat.key}" tem label`);
  assert(typeof cat.icon === "string" && cat.icon.length > 0, `Categoria "${cat.key}" tem icon`);
  assert(typeof cat.color === "string" && cat.color.startsWith("#"), `Categoria "${cat.key}" tem color hex`);
}

// Test 4: cada categoria tem um conjunto razoável de keywords (após #2)
const MIN_KEYWORDS = 30;
for (const cat of categorias) {
  const total = Array.isArray(cat.keywords) ? cat.keywords.length : 0;
  assert(
    total >= MIN_KEYWORDS,
    `Categoria "${cat.key}" tem >= ${MIN_KEYWORDS} keywords (atual: ${total})`
  );
}

// Test 5: keywords não têm duplicatas dentro da mesma categoria (após normalização básica)
function normKw(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
for (const cat of categorias) {
  const seen = new Set();
  const dups = [];
  for (const kw of cat.keywords || []) {
    const n = normKw(kw);
    if (seen.has(n)) dups.push(kw);
    seen.add(n);
  }
  assert(dups.length === 0, `Categoria "${cat.key}" sem duplicatas (encontradas: ${dups.join(", ") || "—"})`);
}

console.log(`\n${falhas === 0 ? "✓ Todos os testes passaram" : `✗ ${falhas} falha(s)`}`);
process.exit(falhas === 0 ? 0 : 1);
