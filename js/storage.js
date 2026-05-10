// js/storage.js
// Gerencia o histórico local das últimas entradas.

const KEY = "brag-matrix-historico";
const LIMITE = 30;

export function salvarHistorico(entrada) {
  const lista = listarHistorico();
  const semDuplicata = lista.filter(e => e.data !== entrada.date);
  semDuplicata.unshift({
    data: entrada.date,
    summary: entrada.summary,
    organizado: entrada,
    timestamp: Date.now()
  });
  const cortado = semDuplicata.slice(0, LIMITE);
  localStorage.setItem(KEY, JSON.stringify(cortado));
}

export function listarHistorico() {
  try {
    const raw = localStorage.getItem(KEY);
    const lista = raw ? JSON.parse(raw) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function removerEntrada(data) {
  const lista = listarHistorico().filter(e => e.data !== data);
  localStorage.setItem(KEY, JSON.stringify(lista));
}

export function limparHistorico() {
  localStorage.removeItem(KEY);
}
