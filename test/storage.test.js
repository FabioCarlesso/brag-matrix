// test/storage.test.js
// Valida salvarHistorico (upsert por data, limite) e removerEntrada.

// Polyfill mínimo de localStorage para rodar em Node.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};

const { salvarHistorico, listarHistorico, removerEntrada, limparHistorico } =
  await import("../js/storage.js");

let falhas = 0;
function assert(cond, msg) {
  if (!cond) { console.error("✗", msg); falhas++; }
  else { console.log("✓", msg); }
}

// 1. Lista vazia inicialmente
limparHistorico();
assert(listarHistorico().length === 0, "Histórico começa vazio");

// 2. Salvar uma entrada
salvarHistorico({ date: "2026-05-10", summary: "primeiro", saude: ["Corri 5km"] });
let lista = listarHistorico();
assert(lista.length === 1 && lista[0].summary === "primeiro", "Salva uma entrada");
assert(
  lista[0].conquistas.length === 1 && lista[0].conquistas[0] === "Saúde - Corri 5km",
  "Salva conquistas no formato Categoria - Conquista"
);

// 3. Salvar duas datas distintas → 2 entradas, mais recente primeiro
salvarHistorico({ date: "2026-05-11", summary: "segundo", estudo: ["Estudei inglês"] });
lista = listarHistorico();
assert(lista.length === 2, "Duas datas distintas → duas entradas");
assert(lista[0].data === "2026-05-11", "Mais recente fica no topo");
assert(lista[0].conquistas[0] === "Estudo - Estudei inglês", "Formato é aplicado em novas entradas");

// 4. Upsert: salvar mesma data sobrescreve
salvarHistorico({ date: "2026-05-10", summary: "primeiro-editado", profissional: ["Fechei o PR"] });
lista = listarHistorico();
assert(lista.length === 2, "Salvar mesma data não duplica");
const r = lista.find(e => e.data === "2026-05-10");
assert(r && r.summary === "primeiro-editado", "Salvar mesma data sobrescreve");
assert(r.conquistas[0] === "Profissional - Fechei o PR", "Upsert atualiza conquistas formatadas");

// 5. removerEntrada
removerEntrada("2026-05-10");
lista = listarHistorico();
assert(lista.length === 1 && lista[0].data === "2026-05-11", "removerEntrada apaga só a data alvo");

// 6. Limite de 30
limparHistorico();
for (let i = 0; i < 35; i++) {
  const d = `2026-${String(1 + Math.floor(i / 30)).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`;
  salvarHistorico({ date: d, summary: `e${i}`, lazer: [`item ${i}`] });
}
lista = listarHistorico();
assert(lista.length === 30, "Limite de 30 entradas é respeitado");

// 7. JSON corrompido retorna lista vazia
localStorage.setItem("brag-matrix-historico", "{nao-eh-json");
assert(Array.isArray(listarHistorico()) && listarHistorico().length === 0, "JSON corrompido → []");

console.log(`\n${falhas === 0 ? "✓ Todos os testes de storage passaram" : `✗ ${falhas} falha(s)`}`);
process.exit(falhas === 0 ? 0 : 1);
