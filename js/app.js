// js/app.js
// Lógica principal da aplicação. Tudo roda no browser — sem backend.

import {
  $,
  renderizarCategorias,
  renderizarHistorico,
  formatarParaDocs,
  mostrarPasso,
  mostrarErro,
  dataLocalISO
} from "./ui.js";
import { organizar } from "./organizador.js";
import { salvarHistorico, listarHistorico, limparHistorico, removerEntrada } from "./storage.js";

let organizadoAtual = null;

function organizarAgora() {
  const texto = $("#texto-bruto").value.trim();
  if (!texto) {
    mostrarErro("Cole alguma anotação antes de organizar.");
    return;
  }
  if (texto.length > 5000) {
    mostrarErro("Texto muito longo (máximo 5000 caracteres).");
    return;
  }

  try {
    organizadoAtual = organizar(texto, dataLocalISO());
    renderizarCategorias(organizadoAtual, $("#resultado"));
    mostrarPasso("revisar");
  } catch (e) {
    mostrarErro(e.message || "Falha ao organizar.");
  }
}

async function copiarFormatado() {
  if (!organizadoAtual) return;
  const texto = formatarParaDocs(organizadoAtual);
  const btn = $("#btn-copiar");
  const original = btn.textContent;

  const sucesso = (label) => {
    btn.textContent = label;
    btn.classList.add("sucesso");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("sucesso");
    }, 2000);
  };

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      sucesso("✓ Copiado!");
      return;
    }
    throw new Error("Clipboard API indisponível");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    document.body.removeChild(ta);
    if (ok) sucesso("✓ Copiado!");
    else mostrarErro("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
  }
}

function salvarESair() {
  if (!organizadoAtual) return;
  salvarHistorico(organizadoAtual);
  mostrarPasso("concluido");
}

function novoRegistro() {
  organizadoAtual = null;
  $("#texto-bruto").value = "";
  $("#resultado").replaceChildren();
  mostrarPasso("entrada");
}

function abrirHistorico() {
  const lista = listarHistorico();
  const container = $("#lista-historico");

  renderizarHistorico(lista, container, {
    onSelecionar: (entrada) => {
      organizadoAtual = entrada.organizado;
      renderizarCategorias(organizadoAtual, $("#resultado"));
      mostrarPasso("revisar");
    },
    onRemover: (entrada) => {
      if (!confirm("Remover esta entrada do histórico?")) return;
      removerEntrada(entrada.data);
      abrirHistorico();
    }
  });

  mostrarPasso("historico");
}

function init() {
  $("#btn-organizar").addEventListener("click", organizarAgora);
  $("#btn-copiar").addEventListener("click", copiarFormatado);
  $("#btn-salvar").addEventListener("click", salvarESair);
  $("#btn-novo").addEventListener("click", novoRegistro);
  $("#btn-novo-2").addEventListener("click", novoRegistro);
  $("#btn-historico").addEventListener("click", abrirHistorico);
  $("#btn-voltar-historico").addEventListener("click", () => mostrarPasso("entrada"));
  $("#btn-limpar-historico").addEventListener("click", () => {
    if (confirm("Apagar todo o histórico local?")) {
      limparHistorico();
      abrirHistorico();
    }
  });

  const hoje = new Date();
  $("#data-hoje").textContent = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  mostrarPasso("entrada");
}

document.addEventListener("DOMContentLoaded", init);
