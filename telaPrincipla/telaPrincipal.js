/* =====================================================
   Trilo - Tela principal
   -----------------------------------------------------
   Os dados de categorias e produtos devem ser gravados
   pela tela de cadastro no localStorage:

   localStorage "trilo_categorias" =
     [ { "id": 1, "nome": "Refeições", "icone": "refeicoes" } ]

   localStorage "trilo_produtos" =
     [ { "id": 10, "categoriaId": 1, "nome": "Prato feito",
         "preco": 24.9, "imagem": "img/prato.png",
         "detalhes": "Arroz, feijão e bife" } ]

   "icone" pode ser: refeicoes, salgados, bebidas
   (qualquer outro valor usa um ícone padrão).
   "imagem" e "detalhes" são opcionais.
   ===================================================== */

// ----- Configurações (ajuste os nomes das suas outras telas) -----
const PAGINA_VOLTAR = "";                 // ex.: "telaInicial.html" (vazio = volta no histórico)
const PAGINA_APOS_CONCLUIR = "telaItemPedido.html";
const USAR_DADOS_DE_EXEMPLO = true;       // coloque false quando o cadastro estiver pronto

// ----- Dados de exemplo (só para testar a tela) -----
const CATEGORIAS_EXEMPLO = [
  { id: 1, nome: "Refeições", icone: "refeicoes" },
  { id: 2, nome: "Salgados", icone: "salgados" },
  { id: 3, nome: "Bebidas", icone: "bebidas" }
];

const PRODUTOS_EXEMPLO = [
  { id: 10, categoriaId: 1, nome: "Prato feito", preco: 24.9, detalhes: "Arroz, feijão e bife" },
  { id: 11, categoriaId: 1, nome: "Executivo de frango", preco: 27.5 },
  { id: 12, categoriaId: 1, nome: "Parmegiana", preco: 29.9 },
  { id: 13, categoriaId: 1, nome: "Macarronada", preco: 22.0 },
  { id: 20, categoriaId: 2, nome: "Coxinha", preco: 7.0, detalhes: "Frango com catupiry" },
  { id: 21, categoriaId: 2, nome: "Pastel de queijo", preco: 8.0 },
  { id: 22, categoriaId: 2, nome: "Esfiha de carne", preco: 7.5 },
  { id: 30, categoriaId: 3, nome: "Suco natural", preco: 9.0, detalhes: "Laranja 300 ml" },
  { id: 31, categoriaId: 3, nome: "Refrigerante lata", preco: 6.0 },
  { id: 32, categoriaId: 3, nome: "Água mineral", preco: 4.0 }
];

// ----- Ícones (SVG) -----
const ICONES = {
  refeicoes:
    '<svg viewBox="0 0 80 80"><path d="M14 52a26 26 0 0 1 52 0z"/><path d="M8 60h64"/><path d="M40 20v-6"/><path d="M34 14h12"/></svg>',
  salgados:
    '<svg viewBox="0 0 80 80"><path d="M12 34a28 22 0 0 1 56 0z"/><path d="M10 46c6 6 10-6 15 0s10-6 15 0 10-6 15 0 10-6 15 0"/><path d="M12 58h56v2a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8z"/></svg>',
  bebidas:
    '<svg viewBox="0 0 80 80"><path d="M14 30h40v18a14 14 0 0 1-14 14H28a14 14 0 0 1-14-14z"/><path d="M54 36h6a8 8 0 0 1 0 16h-8"/><path d="M8 72h56"/></svg>',
  padrao:
    '<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="26"/><path d="M28 40h24M40 28v24"/></svg>'
};

// ----- Estado -----
let categorias = [];
let produtos = [];
let categoriaAtiva = null;
let pedido = []; // [{ id, nome, preco, qtd }]

// ----- Elementos -----
const elCategorias = document.getElementById("categorias");
const elProdutos = document.getElementById("produtos");
const elTela = document.querySelector(".tela");
const elResumo = document.getElementById("resumo");
const elResumoConteudo = document.getElementById("resumoConteudo");
const elResumoTexto = document.getElementById("resumoTexto");
const elResumoItens = document.getElementById("resumoItens");
const btnSeta = document.getElementById("btnSeta");
const btnVoltar = document.getElementById("btnVoltar");
const btnCancelar = document.getElementById("btnCancelar");
const btnConcluir = document.getElementById("btnConcluir");

// ----- Utilidades -----
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function lerStorage(chave) {
  try {
    const valor = JSON.parse(localStorage.getItem(chave));
    return Array.isArray(valor) ? valor : [];
  } catch (e) {
    return [];
  }
}

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ----- Carregar dados -----
function carregarDados() {
  categorias = lerStorage("trilo_categorias");
  produtos = lerStorage("trilo_produtos");

  if (USAR_DADOS_DE_EXEMPLO && categorias.length === 0) {
    categorias = CATEGORIAS_EXEMPLO;
    produtos = PRODUTOS_EXEMPLO;
  }

  categoriaAtiva = categorias.length ? categorias[0].id : null;
}

// ----- Categorias -----
function renderizarCategorias() {
  elCategorias.innerHTML = "";

  categorias.forEach((cat) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "categoria" + (cat.id === categoriaAtiva ? " ativa" : "");
    botao.dataset.id = cat.id;
    botao.innerHTML = (ICONES[cat.icone] || ICONES.padrao) + "<span>" + escapar(cat.nome) + "</span>";
    elCategorias.appendChild(botao);
  });
}

elCategorias.addEventListener("click", (e) => {
  const botao = e.target.closest(".categoria");
  if (!botao) return;
  categoriaAtiva = Number(botao.dataset.id);
  renderizarCategorias();
  renderizarProdutos();
  elProdutos.scrollTop = 0;
});

// ----- Produtos -----
function renderizarProdutos() {
  elProdutos.innerHTML = "";

  const lista = produtos.filter((p) => p.categoriaId === categoriaAtiva);

  lista.forEach((p) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "produto";
    botao.dataset.id = p.id;
    botao.innerHTML =
      (p.imagem ? '<img src="' + escapar(p.imagem) + '" alt="">' : "") +
      '<span class="produto-nome">' + escapar(p.nome) + "</span>" +
      '<span class="produto-preco">' + moeda.format(p.preco) + "</span>";
    elProdutos.appendChild(botao);
  });

  // Quadrados vazios enquanto não houver produtos cadastrados
  const faltam = Math.max(4 - lista.length, 0);
  for (let i = 0; i < faltam; i++) {
    const vazio = document.createElement("div");
    vazio.className = "produto-vazio";
    elProdutos.appendChild(vazio);
  }
}

elProdutos.addEventListener("click", (e) => {
  const botao = e.target.closest(".produto");
  if (!botao) return;
  adicionarAoPedido(Number(botao.dataset.id));
});

// ----- Pedido -----
// Cada toque em um produto cria uma miniatura (uma unidade) no painel.
let proximoUid = 1;

const ICONE_REMOVER =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/></svg>';

function adicionarAoPedido(idProduto) {
  const produto = produtos.find((p) => p.id === idProduto);
  if (!produto) return;

  pedido.push({
    uid: proximoUid++,
    id: produto.id,
    nome: produto.nome,
    preco: produto.preco,
    imagem: produto.imagem || "",
    detalhes: produto.detalhes || ""
  });

  renderizarPedido();
  definirPainelAberto(true);
  elResumoItens.scrollLeft = elResumoItens.scrollWidth; // mostra a miniatura nova
}

function removerDoPedido(uid) {
  pedido = pedido.filter((i) => i.uid !== uid);
  renderizarPedido();
}

elResumoItens.addEventListener("click", (e) => {
  const botao = e.target.closest("[data-remover]");
  if (!botao) return;
  removerDoPedido(Number(botao.dataset.remover));
});

// Roda do mouse rola as miniaturas na horizontal (útil para testar no computador)
elResumoItens.addEventListener(
  "wheel",
  (e) => {
    if (e.deltaY !== 0) {
      elResumoItens.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  },
  { passive: false }
);

// ----- Painel (seta para baixo/cima) -----
function definirPainelAberto(aberto) {
  elResumo.classList.toggle("recolhido", !aberto);
  elTela.classList.toggle("aberto", aberto);
  elResumoConteudo.inert = !aberto;
  btnSeta.setAttribute("aria-expanded", String(aberto));
  btnSeta.setAttribute("aria-label", aberto ? "Recolher pedido" : "Mostrar pedido");
}

btnSeta.addEventListener("click", () => {
  definirPainelAberto(elResumo.classList.contains("recolhido"));
});

function renderizarPedido() {
  elResumoItens.innerHTML = "";

  const vazio = pedido.length === 0;
  elResumo.classList.toggle("vazio", vazio);
  btnConcluir.disabled = vazio;
  btnCancelar.disabled = vazio;

  if (vazio) {
    elResumoTexto.textContent = "Seu pedido está vazio";
    return;
  }

  pedido.forEach((item) => {
    const li = document.createElement("li");
    li.className = "miniatura";
    li.innerHTML =
      '<button type="button" class="miniatura-remover" data-remover="' + item.uid +
      '" aria-label="Remover ' + escapar(item.nome) + '">' + ICONE_REMOVER + "</button>" +
      (item.imagem
        ? '<img src="' + escapar(item.imagem) + '" alt="' + escapar(item.nome) + '">'
        : '<span class="miniatura-nome">' + escapar(item.nome) + "</span>") +
      '<span class="miniatura-preco">' + moeda.format(item.preco) + "</span>";
    elResumoItens.appendChild(li);
  });

  const total = pedido.reduce((soma, i) => soma + i.preco, 0);
  const qtd = pedido.length;
  elResumoTexto.textContent =
    "Total do pedido: " + moeda.format(total) + " (" + qtd + (qtd === 1 ? " item)" : " itens)");
}

// ----- Botões -----
btnVoltar.addEventListener("click", () => {
  if (PAGINA_VOLTAR) {
    window.location.href = PAGINA_VOLTAR;
  } else {
    window.history.back();
  }
});

btnCancelar.addEventListener("click", () => {
  if (pedido.length === 0) return;
  if (window.confirm("Deseja cancelar o pedido?")) {
    pedido = [];
    renderizarPedido();
  }
});

btnConcluir.addEventListener("click", () => {
  if (pedido.length === 0) return;

  const total = pedido.reduce((soma, i) => soma + i.preco, 0);
  localStorage.setItem("trilo_pedido", JSON.stringify({ itens: pedido, total: total }));

  if (PAGINA_APOS_CONCLUIR) {
    window.location.href = PAGINA_APOS_CONCLUIR;
  } else {
    window.alert("Pedido concluído! Defina PAGINA_APOS_CONCLUIR no arquivo telaPrincipal.js para ir à próxima tela.");
  }
});

// ----- Logo: se a imagem não existir, mostra o texto "Trilo" -----
const logo = document.getElementById("logo");
const logoTexto = document.getElementById("logoTexto");
logo.addEventListener("error", () => {
  logo.hidden = true;
  logoTexto.hidden = false;
});

// ----- Início -----
carregarDados();
renderizarCategorias();
renderizarProdutos();
renderizarPedido();
definirPainelAberto(true);