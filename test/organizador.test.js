// test/organizador.test.js
// Valida a classificação local por keywords.

import { organizar } from "../js/organizador.js";

let falhas = 0;
function assert(cond, msg) {
  if (!cond) { console.error("✗", msg); falhas++; }
  else { console.log("✓", msg); }
}

const dataISO = "2026-05-10";

// 1. Itens são separados por linha e bullets removidos
const o1 = organizar(`- Corri 5km de manhã
- Estudei inglês por 30 minutos
* Almocei com a Cah
• Fechei o PR do projeto X`, dataISO);

assert(o1.saude.includes("Corri 5km de manhã"), "Linha de saúde reconhecida");
assert(o1.estudo.includes("Estudei inglês por 30 minutos"), "Linha de estudo reconhecida");
assert(o1.familia.includes("Almocei com a Cah"), "Linha de família reconhecida (almocei com)");
assert(o1.profissional.includes("Fechei o PR do projeto X"), "Linha profissional reconhecida (PR)");

// 2. Bullets variados são limpos
const o2 = organizar("> Meditei 10 min", dataISO);
assert(o2.espiritual.includes("Meditei 10 min"), "Bullet '>' é removido e categoria espiritual classifica");

// 3. Acentos são ignorados
const o3 = organizar("paguei a fatura do cartão", dataISO);
assert(o3.financeiro.length === 1, "Acentos são normalizados — financeiro classifica");

// 4. Sem matches → fallback (lazer por padrão)
const o4 = organizar("xyzabc inventado totalmente", dataISO);
assert(o4.lazer.includes("xyzabc inventado totalmente"), "Fallback para lazer quando nada bate");

// 5. Fallback configurável
const o5 = organizar("xyzabc inventado", dataISO, { fallback: "profissional" });
assert(o5.profissional.includes("xyzabc inventado"), "Fallback configurável funciona");

// 6. Texto vazio → todas as categorias vazias e summary vazio
const o6 = organizar("", dataISO);
assert(o6.summary === "", "Texto vazio → summary vazio");
assert(Object.values(o6).every(v => !Array.isArray(v) || v.length === 0), "Texto vazio → categorias vazias");

// 7. Date é mantida
assert(o1.date === dataISO, "Date é preservada");

// 8. Summary informa contagem
const o8 = organizar("Corri 5km\nLi um livro", dataISO);
assert(o8.summary.includes("2 conquistas"), "Summary informa total de itens");
assert(o8.summary.includes("2 categorias"), "Summary informa total de categorias");

// 9. Linhas em branco não viram itens
const o9 = organizar("\n\n  \n- Treinei\n\n", dataISO);
const total = Object.values(o9).filter(Array.isArray).reduce((s, a) => s + a.length, 0);
assert(total === 1, "Linhas em branco são ignoradas");

// 10. Schema completo: todas as 7 categorias presentes
const cats = ["saude", "familia", "espiritual", "estudo", "lazer", "profissional", "financeiro"];
const o10 = organizar("nada", dataISO);
for (const c of cats) {
  assert(Array.isArray(o10[c]), `Categoria "${c}" é array no resultado`);
}

console.log(`\n${falhas === 0 ? "✓ Todos os testes do organizador passaram" : `✗ ${falhas} falha(s)`}`);
process.exit(falhas === 0 ? 0 : 1);
