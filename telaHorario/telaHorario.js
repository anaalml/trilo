/* =====================================================
   Trilo - Horário de retirada (telaHorario)
   -----------------------------------------------------
   - Horários de 07:00 até 23:00, de 5 em 5 minutos.
   - O horário confirmado fica em localStorage "trilo_horario" (ex.: "14:35")
     e acompanha o pedido até a telaItemPedido.
   - Se a tela for aberta como telaHorario.html?editar=1 (botão "Editar"
     da telaItemPedido), ela já abre com o horário atual e, ao confirmar
     ou voltar, retorna para a telaItemPedido.
   ===================================================== */

// ----- Configurações (ajuste os nomes das suas outras telas) -----
const PAGINA_TIPO_CONSUMO = "../telaTipoConsumo/telaTipoConsumo.html";     // Voltar (fluxo normal)
const PAGINA_APOS_CONFIRMAR = "../telaPrincipal/telaPrincipal.html";     // depois de confirmar (fluxo normal)
const PAGINA_ITEM_PEDIDO = "../telaItemPedido/telaItemPedido.html";       // Voltar/confirmar no modo edição

const HORA_MINIMA = 7;
const HORA_MAXIMA = 23;     // 23:00 é o último horário (só com minutos 00)
const PASSO_MINUTOS = 5;

const CHAVE_HORARIO = "trilo_horario";

// ----- Modo de edição -----
const modoEdicao = new URLSearchParams(window.location.search).get("editar") === "1";

// ----- Estado (null = ainda não escolhido) -----
let hora = null;
let minuto = 0;

// ----- Elementos -----
const caixas = {
  h1: document.getElementById("h1"),
  h2: document.getElementById("h2"),
  m1: document.getElementById("m1"),
  m2: document.getElementById("m2")
};
const digitosHora = document.getElementById("digitosHora");
const digitosMinuto = document.getElementById("digitosMinuto");
const parMinuto = document.getElementById("parMinuto");
const btnConfirmar = document.getElementById("btnConfirmar");
const btnVoltar = document.getElementById("btnVoltar");

// ----- Utilidades -----
const dois = (n) => String(n).padStart(2, "0");

// Primeiro horário sugerido: próximo múltiplo de 5 minutos depois de agora (entre 07:00 e 23:00)
function horarioInicial() {
  const agora = new Date();
  let total = agora.getHours() * 60 + agora.getMinutes();
  total = (Math.floor(total / PASSO_MINUTOS) + 1) * PASSO_MINUTOS;

  if (total < HORA_MINIMA * 60 || total > HORA_MAXIMA * 60) {
    total = HORA_MINIMA * 60;
  }
  return { h: Math.floor(total / 60), m: total % 60 };
}

// Lê o horário já guardado (modo edição)
function horarioGuardado() {
  const m = /^(\d{2}):(\d{2})$/.exec(localStorage.getItem(CHAVE_HORARIO) || "");
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const valido =
    h >= HORA_MINIMA && h <= HORA_MAXIMA &&
    min % PASSO_MINUTOS === 0 &&
    (h < HORA_MAXIMA || min === 0);
  return valido ? { h: h, m: min } : null;
}

// ----- Tela -----
function mostrar(caixa, texto, direcao) {
  if (caixa.dataset.valor === texto) return;
  caixa.dataset.valor = texto;

  if (texto === "") {
    caixa.innerHTML = '<span class="anel"></span>';
    return;
  }

  caixa.textContent = texto;

  // Pequena "rodada" do número novo
  if (direcao && caixa.animate) {
    caixa.animate(
      [
        { transform: "translateY(" + direcao * 45 + "%)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 }
      ],
      { duration: 170, easing: "ease-out" }
    );
  }
}

function renderizar(direcaoHora, direcaoMinuto) {
  const definido = hora !== null;
  const h = definido ? dois(hora) : "  ";
  const m = definido ? dois(minuto) : "  ";

  mostrar(caixas.h1, definido ? h[0] : "", direcaoHora);
  mostrar(caixas.h2, definido ? h[1] : "", direcaoHora);
  mostrar(caixas.m1, definido ? m[0] : "", direcaoMinuto);
  mostrar(caixas.m2, definido ? m[1] : "", direcaoMinuto);

  btnConfirmar.disabled = !definido;

  // 23h só aceita minutos 00
  const minutosTravados = definido && hora === HORA_MAXIMA;
  parMinuto.classList.toggle("bloqueado", minutosTravados);
  digitosMinuto.setAttribute("aria-disabled", String(minutosTravados));

  if (definido) {
    digitosHora.setAttribute("aria-valuenow", String(hora));
    digitosHora.setAttribute("aria-valuetext", hora + " horas");
    digitosMinuto.setAttribute("aria-valuenow", String(minuto));
    digitosMinuto.setAttribute("aria-valuetext", minuto + " minutos");
  }
}

// ----- Mudar valores -----
// Primeira interação: só preenche o horário sugerido, sem somar/subtrair.
function inicializarSeNecessario() {
  if (hora !== null) return false;
  const inicio = horarioInicial();
  hora = inicio.h;
  minuto = inicio.m;
  renderizar(0, 0);
  return true;
}

function mudarHora(delta) {
  if (inicializarSeNecessario()) return;

  hora += delta;
  if (hora > HORA_MAXIMA) hora = HORA_MINIMA;
  if (hora < HORA_MINIMA) hora = HORA_MAXIMA;
  if (hora === HORA_MAXIMA) minuto = 0;

  renderizar(delta, 0);
}

function mudarMinuto(delta) {
  if (inicializarSeNecessario()) return;
  if (hora === HORA_MAXIMA) return; // 23:00 é o limite

  minuto = (minuto + delta * PASSO_MINUTOS + 60) % 60;
  renderizar(0, delta);
}

function mudar(alvo, delta) {
  if (alvo === "hora") mudarHora(delta);
  else mudarMinuto(delta);
}

// ----- Interações: arrastar, roda do mouse, teclado e setas -----
const PASSO_ARRASTO = 38; // px de arrasto para cada mudança

function ligarGestos(elemento, alvo) {
  // Arrastar para cima aumenta, para baixo diminui
  let yInicial = 0;
  let feitos = 0;
  let ativo = false;

  elemento.addEventListener("pointerdown", (e) => {
    ativo = true;
    yInicial = e.clientY;
    feitos = 0;
    elemento.setPointerCapture(e.pointerId);
  });

  elemento.addEventListener("pointermove", (e) => {
    if (!ativo) return;
    const passos = Math.trunc((yInicial - e.clientY) / PASSO_ARRASTO);
    while (feitos < passos) { mudar(alvo, 1); feitos++; }
    while (feitos > passos) { mudar(alvo, -1); feitos--; }
  });

  const soltar = () => { ativo = false; };
  elemento.addEventListener("pointerup", soltar);
  elemento.addEventListener("pointercancel", soltar);

  // Roda do mouse / touchpad
  let acumulado = 0;
  elemento.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      acumulado += e.deltaY;
      while (Math.abs(acumulado) >= 40) {
        mudar(alvo, acumulado > 0 ? 1 : -1);
        acumulado -= Math.sign(acumulado) * 40;
      }
    },
    { passive: false }
  );

  // Teclado
  elemento.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      mudar(alvo, 1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      mudar(alvo, -1);
    }
  });
}

ligarGestos(digitosHora, "hora");
ligarGestos(digitosMinuto, "minuto");

// Setas: um toque muda uma vez; segurando, repete
document.querySelectorAll(".seta").forEach((seta) => {
  let espera = null;
  let repeticao = null;

  const parar = () => {
    clearTimeout(espera);
    clearInterval(repeticao);
  };

  seta.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const alvo = seta.dataset.alvo;
    const delta = Number(seta.dataset.delta);

    mudar(alvo, delta);
    espera = setTimeout(() => {
      repeticao = setInterval(() => mudar(alvo, delta), 140);
    }, 450);
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach((evento) => {
    seta.addEventListener(evento, parar);
  });
});

// ----- Botões -----
btnConfirmar.addEventListener("click", () => {
  if (hora === null) return;

  localStorage.setItem(CHAVE_HORARIO, dois(hora) + ":" + dois(minuto));
  localStorage.setItem("trilo_tipo_consumo", "agendar");

  window.location.href = modoEdicao ? PAGINA_ITEM_PEDIDO : PAGINA_APOS_CONFIRMAR;
});

btnVoltar.addEventListener("click", () => {
  window.location.href = modoEdicao ? PAGINA_ITEM_PEDIDO : PAGINA_TIPO_CONSUMO;
});

// ----- Logo: se a imagem não existir, mostra o texto "Trilo" -----
const logo = document.getElementById("logo");
const logoTexto = document.getElementById("logoTexto");
logo.addEventListener("error", () => {
  logo.hidden = true;
  logoTexto.hidden = false;
});

// ----- Início -----
if (modoEdicao) {
  const atual = horarioGuardado();
  if (atual) {
    hora = atual.h;
    minuto = atual.m;
  }
}
renderizar(0, 0);