/* =====================================================
   Trilo - Cartão de crédito ou débito (telaCartoes)
   ===================================================== */

// ----- Configurações (ajuste os nomes das suas outras telas) -----
const PAGINA_CREDITO = "";                     // ex.: "telaCredito.html"
const PAGINA_DEBITO = "";                      // ex.: "telaDebito.html"

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

// ----- Escolha do tipo de cartão -----
function escolher(tipo, pagina, nomeDaConstante) {
  localStorage.setItem("trilo_forma_pagamento", "cartao");
  localStorage.setItem("trilo_tipo_cartao", tipo);

  if (pagina) {
    window.location.href = pagina;
  } else {
    window.alert("Defina " + nomeDaConstante + " no arquivo telaCartoes.js para ir à próxima tela.");
  }
}

document.getElementById("btnCredito").addEventListener("click", () => {
  escolher("credito", PAGINA_CREDITO, "PAGINA_CREDITO");
});

document.getElementById("btnDebito").addEventListener("click", () => {
  escolher("debito", PAGINA_DEBITO, "PAGINA_DEBITO");
});