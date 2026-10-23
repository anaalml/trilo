/* =====================================================
   Trilo - Modal de cancelamento (compartilhado)
   -----------------------------------------------------
   Como usar em qualquer tela que tenha o botão Cancelar:

   1) No HTML, antes do JS da tela:
        <link rel="stylesheet" href="modalCancelar.css">
        <script src="modalCancelar.js"></script>

   2) No clique do botão Cancelar:
        abrirModalCancelar();

   Sim  -> esquece pedido e dados coletados e vai para a telaDescanso.
   Não  -> só fecha o modal; a tela continua exatamente como estava.
   ===================================================== */

(function () {
  // ----- Configurações -----
  const PAGINA_DESCANSO = "../telaDescanso/telaDescanso.html";

  // Dados do cadastro (cardápio) que NÃO devem ser apagados ao cancelar.
  const CHAVES_MANTIDAS = ["trilo_categorias", "trilo_produtos"];

  let aberto = false;

  // Apaga tudo que foi coletado durante o atendimento (pedido, tipo de consumo, etc.)
  function esquecerDadosDoPedido() {
    Object.keys(localStorage)
      .filter((chave) => chave.startsWith("trilo_") && !CHAVES_MANTIDAS.includes(chave))
      .forEach((chave) => localStorage.removeItem(chave));

    sessionStorage.clear();
  }

  function abrirModalCancelar() {
    if (aberto) return;
    aberto = true;

    const tela = document.querySelector(".tela") || document.body;
    const focoAnterior = document.activeElement;

    // ----- Monta o modal -----
    const fundo = document.createElement("div");
    fundo.className = "modal-cancelar";
    fundo.innerHTML =
      '<div class="modal-cancelar-caixa" role="alertdialog" aria-modal="true" aria-labelledby="modalCancelarTexto">' +
        '<p class="modal-cancelar-texto" id="modalCancelarTexto">Realmente deseja cancelar?</p>' +
        '<div class="modal-cancelar-botoes">' +
          '<button type="button" class="modal-cancelar-sim">Sim</button>' +
          '<button type="button" class="modal-cancelar-nao">Não</button>' +
        "</div>" +
      "</div>";
    tela.appendChild(fundo);

    const btnSim = fundo.querySelector(".modal-cancelar-sim");
    const btnNao = fundo.querySelector(".modal-cancelar-nao");

    // Bloqueia o resto da tela enquanto o modal está aberto (sem alterar nada nela)
    const bloqueados = [];
    Array.from(tela.children).forEach((filho) => {
      if (filho !== fundo && !filho.inert) {
        filho.inert = true;
        bloqueados.push(filho);
      }
    });

    // ----- Fechar (Não): tudo volta exatamente como estava -----
    function fechar() {
      document.removeEventListener("keydown", aoTeclar);
      fundo.remove();
      bloqueados.forEach((filho) => { filho.inert = false; });
      aberto = false;
      if (focoAnterior && typeof focoAnterior.focus === "function") {
        focoAnterior.focus();
      }
    }

    // ----- Confirmar (Sim): esquece tudo e volta para a telaDescanso -----
    function confirmar() {
      esquecerDadosDoPedido();
      window.location.href = PAGINA_DESCANSO;
    }

    function aoTeclar(e) {
      if (e.key === "Escape") {
        fechar();
      } else if (e.key === "Tab") {
        // Mantém o foco entre os dois botões do modal
        e.preventDefault();
        (document.activeElement === btnNao ? btnSim : btnNao).focus();
      }
    }

    btnSim.addEventListener("click", confirmar);
    btnNao.addEventListener("click", fechar);
    document.addEventListener("keydown", aoTeclar);

    btnNao.focus(); // o botão mais seguro fica em foco
  }

  window.abrirModalCancelar = abrirModalCancelar;
  window.esquecerDadosDoPedido = esquecerDadosDoPedido;
})();