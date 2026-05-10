// js/ui.js
// Renderização e manipulação do DOM.

import { categorias } from "./categories/index.js";
import { listarConquistasFormatadas } from "./format.js";

export function $(sel) {
  return document.querySelector(sel);
}

export function dataLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

function parseDataISO(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function focarItem(container, catKey, idx) {
  const sel = `.item-input[data-cat="${catKey}"][data-idx="${idx}"]`;
  const el = container.querySelector(sel);
  if (el) {
    el.focus();
    if (typeof el.setSelectionRange === "function") {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }
}

function renderizarCategoria(cat, organizado, container) {
  const itens = organizado[cat.key] || [];

  const card = document.createElement("div");
  card.className = "categoria";
  card.dataset.cat = cat.key;
  card.style.borderLeftColor = cat.color;

  const header = document.createElement("div");
  header.className = "categoria-header";

  const icon = document.createElement("span");
  icon.className = "cat-icon";
  icon.textContent = cat.icon;
  header.appendChild(icon);

  const label = document.createElement("span");
  label.className = "cat-label";
  label.textContent = cat.label;
  header.appendChild(label);

  const count = document.createElement("span");
  count.className = "cat-count";
  count.style.background = cat.color + "22";
  count.style.color = cat.color;
  count.textContent = String(itens.length);
  header.appendChild(count);

  card.appendChild(header);

  const lista = document.createElement("ul");
  lista.className = "categoria-itens";
  card.appendChild(lista);

  function atualizarCount() {
    count.textContent = String(organizado[cat.key].length);
  }

  function renderItens() {
    lista.innerHTML = "";
    organizado[cat.key].forEach((item, idx) => {
      const li = document.createElement("li");

      const input = document.createElement("input");
      input.type = "text";
      input.value = item;
      input.className = "item-input";
      input.dataset.cat = cat.key;
      input.dataset.idx = String(idx);
      input.setAttribute("aria-label", `Item de ${cat.label}`);
      input.addEventListener("input", (e) => {
        organizado[cat.key][idx] = e.target.value;
      });

      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "btn-remover";
      remover.textContent = "×";
      remover.title = "Remover item";
      remover.setAttribute("aria-label", `Remover item de ${cat.label}`);
      remover.addEventListener("click", () => {
        organizado[cat.key].splice(idx, 1);
        renderItens();
        atualizarCount();
      });

      li.appendChild(input);
      li.appendChild(remover);
      lista.appendChild(li);
    });

    const liAdd = document.createElement("li");
    const btnAdd = document.createElement("button");
    btnAdd.type = "button";
    btnAdd.className = "btn-adicionar";
    btnAdd.textContent = "+ Adicionar item";
    btnAdd.style.color = cat.color;
    btnAdd.style.borderColor = cat.color + "55";
    btnAdd.setAttribute("aria-label", `Adicionar item em ${cat.label}`);
    btnAdd.addEventListener("click", () => {
      organizado[cat.key].push("");
      const novoIdx = organizado[cat.key].length - 1;
      renderItens();
      atualizarCount();
      focarItem(container, cat.key, novoIdx);
    });
    liAdd.appendChild(btnAdd);
    lista.appendChild(liAdd);
  }

  renderItens();
  return card;
}

export function renderizarCategorias(organizado, container) {
  container.replaceChildren();

  if (organizado.summary) {
    const resumo = document.createElement("div");
    resumo.className = "resumo";
    resumo.textContent = `💬 ${organizado.summary}`;
    container.appendChild(resumo);
  }

  categorias.forEach(cat => {
    const itens = organizado[cat.key] || [];
    if (itens.length === 0) return;
    container.appendChild(renderizarCategoria(cat, organizado, container));
  });
}

export function formatarParaDocs(organizado) {
  const d = parseDataISO(organizado.date) || new Date();
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  const semana = d.toLocaleDateString("pt-BR", { weekday: "long" });

  const linhas = [];
  linhas.push(`📅 ${dia}/${mes}/${ano} — ${semana}`);
  if (organizado.summary) linhas.push(`💬 ${organizado.summary}`);
  linhas.push("");

  const conquistas = listarConquistasFormatadas(organizado);
  conquistas.forEach(item => linhas.push(`  • ${item}`));
  if (conquistas.length > 0) linhas.push("");

  linhas.push("─".repeat(40));
  return linhas.join("\n");
}

export function renderizarHistorico(lista, container, { onSelecionar, onRemover }) {
  container.replaceChildren();

  if (lista.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "vazio";
    vazio.textContent = "Nenhuma entrada salva ainda.";
    container.appendChild(vazio);
    return;
  }

  lista.forEach(entrada => {
    const card = document.createElement("div");
    card.className = "entrada-historico";

    const dataDiv = document.createElement("div");
    dataDiv.className = "hist-data";
    const d = parseDataISO(entrada.data);
    dataDiv.textContent = d
      ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
      : entrada.data || "Data desconhecida";
    card.appendChild(dataDiv);

    const resumo = document.createElement("div");
    resumo.className = "hist-resumo";
    resumo.textContent = entrada.summary || "";
    card.appendChild(resumo);

    const acoes = document.createElement("div");
    acoes.className = "hist-acoes";

    const btnRem = document.createElement("button");
    btnRem.type = "button";
    btnRem.className = "btn-remover-entrada";
    btnRem.textContent = "Remover";
    btnRem.setAttribute("aria-label", `Remover entrada de ${dataDiv.textContent}`);
    btnRem.addEventListener("click", (e) => {
      e.stopPropagation();
      onRemover?.(entrada);
    });
    acoes.appendChild(btnRem);
    card.appendChild(acoes);

    card.addEventListener("click", () => onSelecionar?.(entrada));
    container.appendChild(card);
  });
}

export function mostrarPasso(passo) {
  document.querySelectorAll(".passo").forEach(el => el.classList.remove("ativo"));
  $(`#passo-${passo}`).classList.add("ativo");
}

let erroTimeout = null;
export function mostrarErro(msg) {
  const erroEl = $("#erro");
  erroEl.textContent = msg;
  erroEl.classList.add("visivel");
  if (erroTimeout) clearTimeout(erroTimeout);
  erroTimeout = setTimeout(() => {
    erroEl.classList.remove("visivel");
    erroTimeout = null;
  }, 5000);
}
