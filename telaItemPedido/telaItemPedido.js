/* =====================================================
   Trilo - Resumo do pedido (telaItemPedido)
   -----------------------------------------------------
   Lê o pedido gravado pela telaPrincipal em:

   localStorage "trilo_pedido" =
     { "tipoConsumo": "agendar", "horario": "14:35",
       "itens": [ { "uid": 1, "id": 10, "nome": "Prato feito",
                    "detalhes": "Arroz, feijão e bife",
                    "preco": 24.9, "imagem": "img/prato.png" } ],
       "total": 24.9 }
   ===================================================== */

// ----- Configurações (ajuste os nomes das suas outras telas) -----
const PAGINA_HORARIO = "../telaHorario/telaHorario.html?editar=1";   // botão "Editar" do horário
const PAGINA_APOS_CONCLUIR = "../telaPagamento/telaPagamento.html";
const USAR_DADOS_DE_EXEMPLO = true;              // só para testar a tela sem passar pela telaPrincipal

const CHAVE_PEDIDO = "trilo_pedido";

const ITENS_EXEMPLO = [
  { uid: 1, id: 10, nome: "Prato feito", detalhes: "Arroz, feijão e bife", preco: 24.9, imagem: "" },
  { uid: 2, id: 20, nome: "Coxinha", detalhes: "Frango com catupiry", preco: 7.0, imagem: "" },
  { uid: 3, id: 30, nome: "Suco natural", detalhes: "Laranja 300 ml", preco: 9.0, imagem: "" }
];

// ----- Elementos -----
const elLista = document.getElementById("listaItens");
const elVazio = document.getElementById("msgVazio");
const elTotal = document.getElementById("total");
const elRetirada = document.getElementById("retirada");
const elRetiradaHorario = document.getElementById("retiradaHorario");
const btnEditarHorario = document.getElementById("btnEditarHorario");
const btnCancelar = document.getElementById("btnCancelar");
const btnConcluir = document.getElementById("btnConcluir");

// ----- Utilidades -----
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const ICONE_REMOVER =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/></svg>';

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ----- Carregar pedido -----
function carregarPedido() {
  const bruto = localStorage.getItem(CHAVE_PEDIDO);

  if (bruto === null) {
    return USAR_DADOS_DE_EXEMPLO ? ITENS_EXEMPLO.map((i) => ({ ...i })) : [];
  }

  try {
    const dados = JSON.parse(bruto);
    return Array.isArray(dados.itens) ? dados.itens : [];
  } catch (e) {
    return [];
  }
}

let itens = carregarPedido();

function salvarPedido() {
  const total = itens.reduce((soma, i) => soma + i.preco, 0);
  localStorage.setItem(
    CHAVE_PEDIDO,
    JSON.stringify({
      itens: itens,
      total: total,
      tipoConsumo: localStorage.getItem("trilo_tipo_consumo") || "agora",
      horario: horarioAgendado()
    })
  );
}

// Horário de retirada escolhido na telaHorario (ou null se o pedido não foi agendado)
function horarioAgendado() {
  const tipo = localStorage.getItem("trilo_tipo_consumo");
  const horario = localStorage.getItem("trilo_horario");
  return tipo === "agendar" && horario ? horario : null;
}

function renderizarRetirada() {
  const horario = horarioAgendado();
  elRetirada.hidden = !horario;
  if (horario) elRetiradaHorario.textContent = horario;
}

// ----- Tela -----
function renderizar() {
  elLista.innerHTML = "";

  const vazio = itens.length === 0;
  elLista.hidden = vazio;
  elVazio.hidden = !vazio;
  btnConcluir.disabled = vazio;

  itens.forEach((item) => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML =
      '<div class="item-imagem">' +
        (item.imagem ? '<img src="' + escapar(item.imagem) + '" alt="' + escapar(item.nome) + '">' : "") +
        '<button type="button" class="btn-remover" data-remover="' + item.uid +
        '" aria-label="Remover ' + escapar(item.nome) + '">' + ICONE_REMOVER + "</button>" +
      "</div>" +
      '<div class="item-textos">' +
        '<p class="item-nome">' + escapar(item.nome) + "</p>" +
        (item.detalhes ? '<p class="item-detalhes">' + escapar(item.detalhes) + "</p>" : "") +
      "</div>" +
      '<span class="item-preco">' + moeda.format(item.preco) + "</span>";
    elLista.appendChild(li);
  });

  const total = itens.reduce((soma, i) => soma + i.preco, 0);
  elTotal.textContent = "Total " + moeda.format(total);
}

// ----- Eventos -----
elLista.addEventListener("click", (e) => {
  const botao = e.target.closest("[data-remover]");
  if (!botao) return;

  itens = itens.filter((i) => i.uid !== Number(botao.dataset.remover));
  salvarPedido();
  renderizar();
});

// Roda do mouse funciona normalmente na lista; no toque, basta arrastar.

// Editar o horário: abre a telaHorario já com o horário atual e volta para cá
btnEditarHorario.addEventListener("click", () => {
  window.location.href = PAGINA_HORARIO;
});

// Abre o modal. "Sim" esquece tudo e vai para a telaDescanso; "Não" não muda nada aqui.
btnCancelar.addEventListener("click", () => {
  abrirModalCancelar();
});

btnConcluir.addEventListener("click", () => {
  if (itens.length === 0) return;
  salvarPedido();

  if (PAGINA_APOS_CONCLUIR) {
    window.location.href = PAGINA_APOS_CONCLUIR;
  } else {
    window.alert("Pedido confirmado! Defina PAGINA_APOS_CONCLUIR no arquivo telaItemPedido.js para ir à próxima tela.");
  }
});

// ----- Início -----
renderizarRetirada();
renderizar();