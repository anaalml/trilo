/* =====================================================
   Trilo - Opções de pagamento (telaPagamento)
   ===================================================== */

// ----- Configurações (ajuste os nomes das suas outras telas) -----
const PAGINA_PIX = "";                         // ex.: "telaPix.html"
const PAGINA_CARTAO = "telaCartoes.html";
const PAGINA_DINHEIRO = "";                    // ex.: "telaDinheiro.html"

const USAR_DADOS_DE_EXEMPLO = true;            // só para testar sem passar pelas telas anteriores
const TOTAL_EXEMPLO = 40.9;                    // mesmo total dos itens de exemplo da telaItemPedido

// ----- Total do pedido (o mesmo valor mostrado na telaItemPedido) -----
const numero = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function totalDoPedido() {
  const bruto = localStorage.getItem("trilo_pedido");

  if (bruto === null) {
    return USAR_DADOS_DE_EXEMPLO ? TOTAL_EXEMPLO : 0;
  }

  try {
    const dados = JSON.parse(bruto);
    const itens = Array.isArray(dados.itens) ? dados.itens : [];
    return itens.reduce((soma, i) => soma + Number(i.preco || 0), 0);
  } catch (e) {
    return 0;
  }
}

const elTotal = document.getElementById("total");
elTotal.textContent = "Total " + numero.format(totalDoPedido());

// ----- Escolha da forma de pagamento -----
function escolher(forma, pagina, nomeDaConstante) {
  localStorage.setItem("trilo_forma_pagamento", forma);

  if (pagina) {
    window.location.href = pagina;
  } else {
    window.alert("Defina " + nomeDaConstante + " no arquivo telaPagamento.js para ir à próxima tela.");
  }
}

document.getElementById("btnPix").addEventListener("click", () => {
  escolher("pix", PAGINA_PIX, "PAGINA_PIX");
});

document.getElementById("btnCartao").addEventListener("click", () => {
  escolher("cartao", PAGINA_CARTAO, "PAGINA_CARTAO");
});

document.getElementById("btnDinheiro").addEventListener("click", () => {
  escolher("dinheiro", PAGINA_DINHEIRO, "PAGINA_DINHEIRO");
});