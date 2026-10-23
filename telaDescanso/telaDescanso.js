/* =====================================================
   Trilo - Tela de descanso
   -----------------------------------------------------
   A barra rosa de baixo é um botão: a pessoa arrasta
   para cima (com o dedo ou o mouse) e a tela de
   escolha do tipo de consumo abre.
   ===================================================== */

// ----- Configurações -----
const PAGINA_PROXIMA = "../telaTipoConsumo/telaTipoConsumo.html";
const DISTANCIA_MAXIMA = 450;   // até onde a barra sobe (800 - 450 = 350px, topo do painel da próxima tela)
const DISTANCIA_MINIMA = 140;   // arrastou menos que isso: a barra volta para baixo

// ----- Elementos -----
const barra = document.getElementById("barra");

// ----- Estado do arrasto -----
let arrastando = false;
let yInicial = 0;
let subida = 0;
let navegando = false;

function definirSubida(px) {
  subida = Math.max(0, Math.min(px, DISTANCIA_MAXIMA));
  barra.style.setProperty("--dy", subida);
}

barra.addEventListener("pointerdown", (e) => {
  if (navegando) return;
  arrastando = true;
  yInicial = e.clientY;
  barra.setPointerCapture(e.pointerId);
  barra.classList.remove("voltando");
  barra.classList.add("arrastando");
});

barra.addEventListener("pointermove", (e) => {
  if (!arrastando) return;
  definirSubida(yInicial - e.clientY);
});

function soltar() {
  if (!arrastando) return;
  arrastando = false;
  barra.classList.remove("arrastando");

  if (subida >= DISTANCIA_MINIMA) {
    irParaProximaTela();
  } else if (subida < 8) {
    // Só encostou: mostra que é preciso arrastar
    dicaDeArrasto();
    definirSubida(0);
  } else {
    voltarParaBaixo();
  }
}

barra.addEventListener("pointerup", soltar);
barra.addEventListener("pointercancel", soltar);

function voltarParaBaixo() {
  barra.classList.add("voltando");
  definirSubida(0);
}

function dicaDeArrasto() {
  if (barra.animate) {
    barra.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-60px)", offset: 0.4 },
        { transform: "translateY(0)" }
      ],
      { duration: 550, easing: "ease-out" }
    );
  }
}

function irParaProximaTela() {
  if (navegando) return;
  navegando = true;
  barra.classList.add("concluindo");
  definirSubida(DISTANCIA_MAXIMA);
  setTimeout(() => {
    window.location.href = PAGINA_PROXIMA;
  }, 380);
}

// Teclado (acessibilidade): Enter ou espaço também começam o pedido
barra.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    irParaProximaTela();
  }
});

// Evita o "arrastar imagem" do navegador
document.addEventListener("dragstart", (e) => e.preventDefault());

// ----- Logo: se a imagem não existir, mostra o texto "Trilo" -----
const logo = document.getElementById("logo");
const logoTexto = document.getElementById("logoTexto");
logo.addEventListener("error", () => {
  logo.hidden = true;
  logoTexto.hidden = false;
});