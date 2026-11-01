/* =====================================================================
   LÓGICA DE LA WEB
   - Inyecta los datos de config.js en toda la página
   - Construye los enlaces de WhatsApp (con mensaje prerrellenado) y teléfono
   - Menú móvil, FAQ acordeón, burbuja de WhatsApp, banner de cookies,
     animaciones al hacer scroll y envío del formulario por WhatsApp
   ===================================================================== */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  // --- Enlaces base -----------------------------------------------------
  var waLink =
    "https://wa.me/" +
    (cfg.whatsapp || "") +
    "?text=" +
    encodeURIComponent(cfg.mensajeWhatsapp || "Hola, me gustaría más información.");
  var telLink = "tel:" + (cfg.telefono || "");
  var mailLink = "mailto:" + (cfg.email || "");

  // --- Inyección de datos al cargar -------------------------------------
  function inject() {
    // Textos: cualquier elemento con data-config="clave"
    document.querySelectorAll("[data-config]").forEach(function (el) {
      var key = el.getAttribute("data-config");
      if (cfg[key]) el.textContent = cfg[key];
    });

    // Botones / enlaces de WhatsApp
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      el.setAttribute("href", waLink);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });

    // Botones / enlaces de teléfono
    document.querySelectorAll("[data-tel]").forEach(function (el) {
      el.setAttribute("href", telLink);
    });

    // Enlaces de email
    document.querySelectorAll("[data-mail]").forEach(function (el) {
      el.setAttribute("href", mailLink);
    });

    // Año actual en el footer
    var y = document.querySelector("[data-year]");
    if (y) {
      // new Date sin argumentos para mostrar el año vigente
      y.textContent = new Date().getFullYear();
    }
  }

  // --- Menú móvil -------------------------------------------------------
  function menu() {
    var btn = document.querySelector(".nav__toggle");
    var nav = document.querySelector(".nav__links");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Cerrar al pulsar un enlace
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- FAQ acordeón -----------------------------------------------------
  function faq() {
    document.querySelectorAll(".faq__item").forEach(function (item) {
      var q = item.querySelector(".faq__question");
      if (!q) return;
      q.addEventListener("click", function () {
        var open = item.classList.toggle("is-open");
        q.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  // --- Burbuja del botón flotante de WhatsApp ---------------------------
  function bubble() {
    var bubbleEl = document.querySelector(".wa-float__bubble");
    var closeEl = document.querySelector(".wa-float__close");
    if (!bubbleEl) return;
    // Aparece a los 2,5 segundos
    setTimeout(function () {
      bubbleEl.classList.add("is-visible");
    }, 2500);
    if (closeEl) {
      closeEl.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        bubbleEl.classList.remove("is-visible");
      });
    }
  }

  // --- Animaciones al hacer scroll --------------------------------------
  function reveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(function (el) { obs.observe(el); });
  }

  // --- Cabecera con sombra al hacer scroll ------------------------------
  function header() {
    var h = document.querySelector(".header");
    if (!h) return;
    function onScroll() {
      if (window.scrollY > 20) h.classList.add("is-scrolled");
      else h.classList.remove("is-scrolled");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // --- Formulario de contacto -> WhatsApp -------------------------------
  function form() {
    var f = document.querySelector("#contact-form");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = (f.querySelector("#nombre") || {}).value || "";
      var telefono = (f.querySelector("#telefono") || {}).value || "";
      var caso = (f.querySelector("#caso") || {}).value || "";
      var consent = f.querySelector("#consent");
      if (consent && !consent.checked) {
        consent.focus();
        return;
      }
      var texto =
        "Hola, soy " + nombre + " (tel: " + telefono + ").\n" +
        "Mi caso: " + caso + "\n(Lo he visto en vuestra web)";
      var url =
        "https://wa.me/" + (cfg.whatsapp || "") + "?text=" + encodeURIComponent(texto);
      window.open(url, "_blank", "noopener");
    });
  }

  // --- Contador de clics (solo cuenta: tipo de botón y página, nada personal) ---
  function contar(tipo) {
    try {
      var datos = JSON.stringify({ t: tipo, p: location.pathname });
      // El contador vive en Cloudflare; la web, en GitHub Pages (por los bloqueos de LaLiga).
      var api = "https://abogado-trafico.pages.dev/api/clic";
      if (navigator.sendBeacon) navigator.sendBeacon(api, new Blob([datos], { type: "text/plain" }));
      else fetch(api, { method: "POST", body: datos, keepalive: true, mode: "no-cors" });
    } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-wa],[data-tel],a[href^='tel:'],a[href*='wa.me']");
    if (!el) return;
    var h = el.getAttribute("href") || "";
    contar(el.hasAttribute("data-tel") || h.indexOf("tel:") === 0 ? "llamar" : "whatsapp");
  }, true);
  document.addEventListener("submit", function () { contar("formulario"); }, true);

  // --- Banner de cookies ------------------------------------------------
  function cookies() {
    var banner = document.querySelector(".cookies");
    var accept = document.querySelector(".cookies__accept");
    if (!banner) return;
    var stored;
    try { stored = window.localStorage.getItem("cookies-ok"); } catch (e) { stored = null; }
    if (!stored) banner.classList.add("is-visible");
    if (accept) {
      accept.addEventListener("click", function () {
        try { window.localStorage.setItem("cookies-ok", "1"); } catch (e) {}
        banner.classList.remove("is-visible");
      });
    }
  }

  // --- Init -------------------------------------------------------------
  function init() {
    inject();
    menu();
    faq();
    bubble();
    reveal();
    header();
    form();
    cookies();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
