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

// 4. Sem matches → fallback (família por padrão)
const o4 = organizar("xyzabc inventado totalmente", dataISO);
assert(o4.familia.includes("xyzabc inventado totalmente"), "Fallback para família quando nada bate");

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

// 11. Novas keywords ampliadas (#2): cada categoria classifica termos novos comuns
const novos = [
  ["Fui na academia hoje cedo", "saude"],
  ["Fiz uma trilha no parque", "saude"],
  ["Visitei minha avó", "familia"],
  ["Mandei mensagem pro meu primo", "familia"],
  ["Participei do grupo de oração", "espiritual"],
  ["Rezei o terço hoje", "espiritual"],
  ["Concluí o curso da Alura", "estudo"],
  ["Estudei matemática para o ENEM", "estudo"],
  ["Fui ao cinema com a galera", "lazer"],
  ["Acampamento no fim de semana", "lazer"],
  ["Subi pra produção sem incidente", "profissional"],
  ["Fiz code review do PR", "profissional"],
  ["Fiz um aporte na bolsa de valores", "financeiro"],
  ["Recebi cashback no cartão", "financeiro"]
];
for (const [linha, esperado] of novos) {
  const r = organizar(linha, dataISO);
  assert(
    (r[esperado] || []).includes(linha),
    `"${linha}" → ${esperado} (recebeu: ${
      Object.entries(r).find(([k, v]) => Array.isArray(v) && v.includes(linha))?.[0] || "?"
    })`
  );
}

// 12. Metadados do WhatsApp são removidos (#3)
const o12 = organizar("[12:20, 10/05/2026] Fabio Carlesso: Corri 5km de manhã", dataISO);
assert(o12.saude.includes("Corri 5km de manhã"), "WhatsApp [hora, data] Remetente: é removido");
assert(!JSON.stringify(o12).includes("Fabio Carlesso"), "Nome do remetente não vaza para o item");
assert(!JSON.stringify(o12).includes("12:20"), "Horário não vaza para o item");

const o12b = organizar("[10/05/2026, 12:20] Fabio: Estudei inglês por 30 minutos", dataISO);
assert(o12b.estudo.includes("Estudei inglês por 30 minutos"), "WhatsApp [data, hora] Remetente: é removido");

const o12c = organizar("12:20 - Fabio Carlesso: Almocei com a Cah", dataISO);
assert(o12c.familia.includes("Almocei com a Cah"), "WhatsApp 'hora - Remetente:' (sem colchetes) é removido");

const o12d = organizar("10/05/2026 12:20 - Fabio: Meditei 10 min", dataISO);
assert(o12d.espiritual.includes("Meditei 10 min"), "WhatsApp 'data hora - Remetente:' é removido");

// 13. Bullets antes do prefixo do WhatsApp também são tratados
const o13 = organizar("- [12:20, 10/05/2026] Fabio: Treinei pernas", dataISO);
assert(o13.saude.includes("Treinei pernas"), "Bullet + prefixo WhatsApp ambos removidos");

// 14. Múltiplas linhas no estilo WhatsApp
const o14 = organizar(`[12:20, 10/05/2026] Fabio: Corri 5km
[12:25, 10/05/2026] Fabio: Estudei React
[12:30, 10/05/2026] Fabio: Almocei com a Cah`, dataISO);
assert(o14.saude.includes("Corri 5km"), "Multi-linha WhatsApp: linha 1");
assert(o14.estudo.includes("Estudei React"), "Multi-linha WhatsApp: linha 2");
assert(o14.familia.includes("Almocei com a Cah"), "Multi-linha WhatsApp: linha 3");

// 15. Linhas sem prefixo do WhatsApp continuam funcionando
const o15 = organizar("Corri 5km de manhã", dataISO);
assert(o15.saude.includes("Corri 5km de manhã"), "Linha sem prefixo WhatsApp passa intacta");

// 16. Texto comum com ':' no meio NÃO é confundido com prefixo do WhatsApp
const o16 = organizar("Reunião com o time: revisamos o roadmap", dataISO);
const r16 = Object.entries(o16).find(([k, v]) => Array.isArray(v) && v.includes("Reunião com o time: revisamos o roadmap"));
assert(!!r16, "Texto comum com ':' não é tratado como prefixo WhatsApp");

console.log(`\n${falhas === 0 ? "✓ Todos os testes do organizador passaram" : `✗ ${falhas} falha(s)`}`);
process.exit(falhas === 0 ? 0 : 1);
