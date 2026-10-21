/* =====================================================
   Trilo - Tipo de consumo (telaTipoConsumo)
   ===================================================== */

// ----- Configurações (ajuste os nomes das suas outras telas) -----
const PAGINA_VOLTAR = "telaDescanso.html";
const PAGINA_COMER_AGORA = "telaPrincipal.html";

const PAGINA_AGENDAR_PEDIDO = "telaHorario.html";


// ----- Elementos -----
const btnVoltar = document.getElementById("btnVoltar");
const btnComerAgora = document.getElementById("btnComerAgora");
const btnAgendar = document.getElementById("btnAgendar");

// Guarda a escolha para as próximas telas ("agora" ou "agendar")
function guardarTipoConsumo(tipo) {
  localStorage.setItem("trilo_tipo_consumo", tipo);
}

// ----- Botões -----
btnVoltar.addEventListener("click", () => {
  window.location.href = PAGINA_VOLTAR;
});

btnComerAgora.addEventListener("click", () => {
  guardarTipoConsumo("agora");

  localStorage.removeItem("trilo_horario"); // se tinha agendado antes, esquece o horário


});

btnAgendar.addEventListener("click", () => {
  guardarTipoConsumo("agendar");

  if (PAGINA_AGENDAR_PEDIDO) {
    window.location.href = PAGINA_AGENDAR_PEDIDO;
  } else {
    window.alert("Defina PAGINA_AGENDAR_PEDIDO no arquivo telaTipoConsumo.js para ir à tela de agendamento.");
  }
});

// ----- Logo: se a imagem não existir, mostra o texto "Trilo" -----
const logo = document.getElementById("logo");
const logoTexto = document.getElementById("logoTexto");
logo.addEventListener("error", () => {
  logo.hidden = true;
  logoTexto.hidden = false;
});