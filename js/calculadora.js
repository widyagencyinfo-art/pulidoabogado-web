/* Calculadora orientativa de indemnización por lesiones temporales (baremo Ley 35/2015).
   Importes/día del baremo de tráfico VIGENTE EN 2026 (actualización +2,9% s/ 2025). Resultado
   ORIENTATIVO: no incluye secuelas ni lucro cesante, que se suman aparte y requieren valoración. */
(function () {
  "use strict";
  // Baremo 2026 — perjuicio personal por día de lesión temporal
  var EUR_DIA = { basico: 39.20, moderado: 67.96, grave: 98.02, muygrave: 130.69 };
  // Intervención quirúrgica 2026: 522,76 € – 2.091,05 € según grupo. Usamos un valor medio orientativo.
  var EUR_CIRUGIA = 1100;

  function eur(n) {
    return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  }
  function val(id) {
    var el = document.getElementById(id);
    var n = parseInt((el && el.value) || "0", 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function calcular() {
    var dias = { basico: val("calc-basico"), moderado: val("calc-moderado"), grave: val("calc-grave"), muygrave: val("calc-muygrave") };
    var cirugias = val("calc-cirugia");
    var partes = [
      { k: "basico", txt: "Recuperación básica (vida casi normal)", dias: dias.basico, imp: dias.basico * EUR_DIA.basico },
      { k: "moderado", txt: "Recuperación moderada (limitación parcial)", dias: dias.moderado, imp: dias.moderado * EUR_DIA.moderado },
      { k: "grave", txt: "Recuperación grave (sin tu vida habitual / baja total)", dias: dias.grave, imp: dias.grave * EUR_DIA.grave },
      { k: "muygrave", txt: "Días de ingreso hospitalario", dias: dias.muygrave, imp: dias.muygrave * EUR_DIA.muygrave }
    ];
    var total = partes.reduce(function (s, p) { return s + p.imp; }, 0);
    var impCirugia = cirugias * EUR_CIRUGIA;
    total += impCirugia;

    var box = document.getElementById("calc-result");
    if (total <= 0) {
      box.innerHTML = '<p class="calc__note" style="margin:0;">Introduce al menos un número de días para ver tu estimación.</p>';
      box.classList.add("is-visible");
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    var rows = partes.filter(function (p) { return p.dias > 0; }).map(function (p) {
      return '<li><span>' + p.txt + ' · ' + p.dias + ' días</span><span>' + eur(p.imp) + '</span></li>';
    }).join("");
    if (cirugias > 0) {
      rows += '<li><span>Intervención quirúrgica · ' + cirugias + (cirugias === 1 ? ' operación' : ' operaciones') + '</span><span>' + eur(impCirugia) + '</span></li>';
    }

    var min = Math.round(total * 0.9);
    var max = Math.round(total * 1.15);

    var cfg = window.SITE_CONFIG || {};
    var msg = "Hola, he usado vuestra calculadora y me sale una indemnización orientativa de " +
      eur(min) + " a " + eur(max) + " por mis días de lesión. ¿Me ayudáis a calcular lo que me corresponde de verdad?";
    var waLink = "https://wa.me/" + (cfg.whatsapp || "") + "?text=" + encodeURIComponent(msg);

    box.innerHTML =
      '<div class="calc__total">' +
        '<span class="calc__total-label">Indemnización orientativa por tus días de lesión</span>' +
        '<span class="calc__total-amount">' + eur(min) + ' – ' + eur(max) + '</span>' +
        '<span class="calc__total-sub">Estimación base: ' + eur(total) + '</span>' +
      '</div>' +
      '<ul class="calc__breakdown">' + rows + '</ul>' +
      '<p class="calc__note"><strong>Esto es solo una parte.</strong> A esta cantidad se suelen sumar las <strong>secuelas</strong> (lo que te queda después, valorado en puntos), los <strong>gastos</strong> (médicos, rehabilitación, desplazamientos) y el <strong>lucro cesante</strong> (lo que dejaste de ingresar). Con secuelas, la indemnización suele ser <strong>bastante mayor</strong>.</p>' +
      '<div class="calc__cta">' +
        '<a href="' + waLink + '" target="_blank" rel="noopener" class="btn btn--wa btn--lg">Quiero el cálculo exacto gratis por WhatsApp</a>' +
      '</div>' +
      '<p class="calc__disclaimer">Cálculo orientativo según el baremo de tráfico (Ley 35/2015), con los importes vigentes en 2026. No constituye una valoración jurídica ni garantiza ninguna cantidad: cada caso se estudia de forma individual y gratuita.</p>';

    box.classList.add("is-visible");
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calc-btn");
    if (btn) btn.addEventListener("click", calcular);
    var form = document.getElementById("calc-form");
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); calcular(); });
  });
})();
