/* Lógica principal del calendario. El contenido está en contenido.js */
(function () {
  "use strict";

  // Si contenido.js tiene un error (una coma o unas comillas), CALENDARIO no existe
  const C = typeof CALENDARIO !== "undefined" ? CALENDARIO : null; // definido en contenido.js
  if (!C || !Array.isArray(C.dias)) {
    document.getElementById("escena").innerHTML =
      '<div style="max-width:520px;margin:30px auto;padding:20px;border-radius:16px;background:#fffaf0;color:#3b2a1a;font-size:17px;line-height:1.4">' +
      "<strong>⚠️ Hay un error en contenido.js.</strong><br>Revisa las comas y las comillas cerca de lo último que cambiaste. " +
      "Cada bloque { ... } va separado por una coma y cada texto va entre comillas \"...\".</div>";
    return;
  }
  const { el, esImagen } = window.JuegosUtil;
  const $ = (s) => document.querySelector(s);
  const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Modo prueba ---------- */
  const params = new URLSearchParams(location.search);
  const CLAVE_PRUEBA = "adviento-modo-prueba";
  if (C.claveModoPrueba && params.get("prueba") === C.claveModoPrueba) localStorage.setItem(CLAVE_PRUEBA, "1");
  const modoPrueba = Boolean(C.claveModoPrueba) && localStorage.getItem(CLAVE_PRUEBA) === "1";
  if (params.has("prueba")) history.replaceState(null, "", location.pathname); // limpia la clave de la barra de direcciones

  /* ---------- Progreso ---------- */
  const CLAVE_PROGRESO = modoPrueba ? "adviento-progreso-prueba" : "adviento-progreso-" + C.anio;
  let progreso = {};
  try { progreso = JSON.parse(localStorage.getItem(CLAVE_PROGRESO)) || {}; } catch (e) { progreso = {}; }
  progreso.completados = progreso.completados || {};
  const guardar = () => localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
  const completado = (d) => Boolean(progreso.completados[d]);

  /* ---------- Fechas (hora local del dispositivo) ---------- */
  const ahora = () => new Date();
  const fechaDia = (d) => new Date(C.anio, 11, d, 0, 0, 0);
  const desbloqueado = (d) => modoPrueba || ahora() >= fechaDia(d);
  const esHoy = (d) => { const n = ahora(); return n.getFullYear() === C.anio && n.getMonth() === 11 && n.getDate() === d; };
  const diasHasta = (d) => Math.ceil((fechaDia(d) - ahora()) / 86400000);
  const datosDia = (d) => C.dias.find((x) => x.dia === d) || { dia: d, titulo: `Día ${d}`, reto: { tipo: "ninguno" }, premio: {} };

  /* ---------- Aleatorio con semilla (el pueblo siempre sale igual) ---------- */
  function semilla(s) {
    return function () {
      s |= 0; s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- Escena ---------- */
  const COLORES = ["#c0392b", "#2e7d5b", "#e0a83a", "#3b6ea5", "#8e4b8a", "#d35f3d", "#efe0c2", "#7b5a43", "#4f8a8b"];
  const TEJADOS = ["#5b2a1e", "#3a2a4a", "#7a1f1f", "#2b3a55", "#40302a"];
  const BOMBILLAS = ["#ff4d5e", "#ffd36b", "#5fd3ff", "#7dff9a", "#ff9ff3"];
  let disposicionActual = null;

  function disposicion() {
    const vertical = window.innerWidth < 760 || window.innerWidth < window.innerHeight * 0.9;
    return vertical
      ? { id: "v", W: 400, cols: 4, filas: 6, filaH: 124, arriba: 96, escala: 1, abajo: 40 }
      : { id: "h", W: 1200, cols: 8, filas: 3, filaH: 178, arriba: 110, escala: 1.35, abajo: 50 };
  }

  function arbol(x, y, s, rnd) {
    const capas = 3;
    let p = "";
    for (let i = 0; i < capas; i++) {
      const ancho = (22 - i * 5) * s, alto = 18 * s, base = y - i * 11 * s;
      p += `<polygon points="${x - ancho},${base} ${x},${base - alto - 6 * s} ${x + ancho},${base}" fill="${i % 2 ? "#1d5a3e" : "#174a33"}"/>`;
      p += `<path d="M${x - ancho * 0.75},${base - 2 * s} q${ancho * 0.375},-${5 * s} ${ancho * 0.75},0 q${ancho * 0.375},-${4 * s} ${ancho * 0.75},0" fill="none" stroke="#fff" stroke-width="${2.2 * s}" stroke-linecap="round" opacity=".9"/>`;
    }
    const cima = y - (capas - 1) * 11 * s - 24 * s;
    if (rnd() < 0.35) p += `<text x="${x}" y="${cima + 4 * s}" font-size="${12 * s}" text-anchor="middle">⭐</text>`;
    return `<g><rect x="${x - 2.5 * s}" y="${y - 2}" width="${5 * s}" height="${7 * s}" fill="#4a3020"/>${p}</g>`;
  }

  function casa(dia, x, y, s, rnd) {
    const estilo = Math.floor(rnd() * 3);
    let w = (62 + rnd() * 14) * s, h = (50 + rnd() * 12) * s, tejadoH = (28 + rnd() * 8) * s;
    if (estilo === 1) { w *= 0.86; h *= 1.22; tejadoH *= 1.15; }
    if (estilo === 2) { w *= 1.12; h *= 0.9; tejadoH *= 0.8; }
    const color = COLORES[Math.floor(rnd() * COLORES.length)];
    const tejado = TEJADOS[Math.floor(rnd() * TEJADOS.length)];
    const claro = color === "#efe0c2";
    const vw = w * 0.2, vh = h * 0.24, vy = -h + h * 0.16;
    const chX = (rnd() < 0.5 ? -1 : 1) * w * 0.24;
    const chY = -h - tejadoH * 0.55;
    let bombillas = "";
    if (rnd() < 0.7) {
      const n = 6;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const bx = -w / 2 - 4 * s + t * (w / 2 + 4 * s), by = -h + 3 - t * tejadoH;
        const bx2 = w / 2 + 4 * s - t * (w / 2 + 4 * s);
        [bx, bx2].forEach((xx, k) => {
          if (k === 1 && i === n) return;
          bombillas += `<circle class="bombilla" cx="${xx.toFixed(1)}" cy="${(by + 3 * s).toFixed(1)}" r="${2.1 * s}" fill="${BOMBILLAS[(i + k * 2) % BOMBILLAS.length]}" style="animation-delay:${((i + k) % 4) * 0.4}s"/>`;
        });
      }
    }
    const puertaW = w * 0.3, puertaH = h * 0.42;
    const r = 12 * s;
    const placaY = -h - Math.min(tejadoH * 0.36, tejadoH - r - 4 * s);
    const etiqueta = `Día ${dia}`;
    return `
<g class="casa" data-dia="${dia}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" tabindex="0" role="button" aria-label="${etiqueta}">
  <ellipse class="halo" cx="0" cy="${-h * 0.55}" rx="${w * 0.95}" ry="${(h + tejadoH) * 0.85}" fill="url(#halo)"/>
  <g class="cuerpo-casa">
    <rect x="${chX - 6 * s}" y="${chY - 12 * s}" width="${12 * s}" height="${20 * s}" fill="#6e3a2c"/>
    <rect x="${chX - 7.5 * s}" y="${chY - 15 * s}" width="${15 * s}" height="${5 * s}" rx="${2.5 * s}" fill="#fff"/>
    <g class="humos">
      <circle class="humo" cx="${chX}" cy="${chY - 20 * s}" r="${5 * s}" fill="#cfd8ea"/>
      <circle class="humo" cx="${chX}" cy="${chY - 20 * s}" r="${5 * s}" fill="#cfd8ea" style="animation-delay:1.3s"/>
      <circle class="humo" cx="${chX}" cy="${chY - 20 * s}" r="${5 * s}" fill="#cfd8ea" style="animation-delay:2.6s"/>
    </g>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${color}"/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="url(#sombraCasa)"/>
    <polygon points="${-w / 2 - 7 * s},${-h + 3} 0,${-h - tejadoH} ${w / 2 + 7 * s},${-h + 3}" fill="${tejado}"/>
    <path d="M${-w / 2 - 8 * s},${-h + 2} L0,${-h - tejadoH - 2} L${w / 2 + 8 * s},${-h + 2}" fill="none" stroke="#fff" stroke-width="${6 * s}" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${-w * 0.3}" cy="${-h + 4 * s}" r="${2.6 * s}" fill="#fff"/><circle cx="${w * 0.22}" cy="${-h + 5 * s}" r="${3 * s}" fill="#fff"/>
    ${bombillas}
    <rect class="ventana" x="${-w * 0.36}" y="${vy}" width="${vw}" height="${vh}" rx="${2 * s}"/>
    <rect class="ventana" x="${w * 0.16}" y="${vy}" width="${vw}" height="${vh}" rx="${2 * s}"/>
    <path d="M${-w * 0.36 + vw / 2},${vy} v${vh} M${-w * 0.36},${vy + vh / 2} h${vw} M${w * 0.16 + vw / 2},${vy} v${vh} M${w * 0.16},${vy + vh / 2} h${vw}" stroke="${claro ? "#7b5a43" : "#fff"}" stroke-width="${1.4 * s}" opacity=".8"/>
    <rect class="puerta" x="${-puertaW / 2}" y="${-puertaH}" width="${puertaW}" height="${puertaH}" rx="${puertaW / 2}" ry="${puertaW / 2.4}" fill="#5a3522"/>
    <rect class="puerta-abierta" x="${-puertaW / 2}" y="${-puertaH}" width="${puertaW}" height="${puertaH}" rx="${puertaW / 2}" ry="${puertaW / 2.4}" fill="#ffcf6b" opacity="0"/>
    <path d="M${-w / 2 - 4 * s},0 q${w * 0.25},${-7 * s} ${w * 0.5},${-3 * s} t${w * 0.5 + 8 * s},${2 * s} v${4 * s} h${-w - 8 * s} z" fill="#fff"/>
    <circle class="placa" cx="0" cy="${placaY}" r="${r}" fill="#fff" stroke="#d7263d" stroke-width="${2.2 * s}"/>
    <text class="numero" x="0" y="${placaY + 5.2 * s}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="${15 * s}" fill="#b3122a">${dia}</text>
    <text class="sello" x="${w / 2 - 2 * s}" y="${-h + 14 * s}" text-anchor="middle" font-size="${13 * s}" opacity="0">⭐</text>
  </g>
  <rect x="${-w / 2 - 8 * s}" y="${-h - tejadoH - 6}" width="${w + 16 * s}" height="${h + tejadoH + 10}" fill="transparent"/>
</g>`;
  }

  function dibujarEscena() {
    const D = disposicion();
    disposicionActual = D.id;
    const rnd = semilla(2412);
    const H = D.arriba + D.filas * D.filaH + D.abajo;
    const colW = D.W / D.cols;

    // Reparto de días por la escena, desordenado pero siempre igual
    const dias = [...Array(24).keys()].map((i) => i + 1);
    for (let i = dias.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [dias[i], dias[j]] = [dias[j], dias[i]]; }

    let svg = `<svg viewBox="0 0 ${D.W} ${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="halo"><stop offset="0" stop-color="#ffd36b" stop-opacity=".55"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient>
  <linearGradient id="sombraCasa" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
  <radialGradient id="luna"><stop offset=".6" stop-color="#fffbe6"/><stop offset="1" stop-color="#fffbe6" stop-opacity="0"/></radialGradient>
  <filter id="brillo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;
    // Cielo: luna y estrellas
    svg += `<circle cx="${D.W - 60 * D.escala}" cy="${46 * D.escala}" r="${40 * D.escala}" fill="url(#luna)" opacity=".5"/>`;
    svg += `<circle cx="${D.W - 60 * D.escala}" cy="${46 * D.escala}" r="${24 * D.escala}" fill="#fffbe6"/>`;
    svg += `<circle cx="${D.W - 52 * D.escala}" cy="${40 * D.escala}" r="${24 * D.escala}" fill="#0b1736" opacity=".0"/>`;
    for (let i = 0; i < (D.id === "v" ? 26 : 60); i++) {
      svg += `<circle class="estrella-cielo" cx="${(rnd() * D.W).toFixed(0)}" cy="${(rnd() * (D.arriba + 30)).toFixed(0)}" r="${(0.6 + rnd() * 1.4).toFixed(1)}" fill="#fff" style="animation-delay:${(rnd() * 3).toFixed(1)}s"/>`;
    }
    // Montañas al fondo
    svg += `<path d="M-1500,${D.arriba + 40} L0,${D.arriba + 40} L${D.W * 0.18},${D.arriba - 10} L${D.W * 0.32},${D.arriba + 30} L${D.W * 0.5},${D.arriba - 30} L${D.W * 0.7},${D.arriba + 25} L${D.W * 0.85},${D.arriba - 5} L${D.W},${D.arriba + 35} L${D.W + 1500},${D.arriba + 35} V${H} H-1500 Z" fill="#22355f" opacity=".8"/>`;

    let k = 0;
    for (let f = 0; f < D.filas; f++) {
      const base = D.arriba + (f + 1) * D.filaH - 10;
      const amp = 8 * D.escala, fase = rnd() * 6, freq = (Math.PI * 2) / (D.W * (0.6 + rnd() * 0.3));
      const alturaColina = (x) => base + Math.sin(x * freq + fase) * amp;
      // Colina
      const tono = 225 + Math.round((f / (D.filas - 1 || 1)) * 25);
      const X0 = -1500, X1 = D.W + 1500, fondo = H + 600;
      let d = `M${X0},${(alturaColina(X0) - 4).toFixed(1)}`;
      for (let x = X0 + 20; x <= X1; x += 20) d += ` L${x},${(alturaColina(x) - 4).toFixed(1)}`;
      const borde = d;
      d += ` L${X1},${fondo} L${X0},${fondo} Z`;
      svg += `<path d="${d}" fill="rgb(${tono - 18},${tono - 8},${Math.min(255, tono + 20)})"/>`;
      svg += `<path d="${borde}" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>`;
      // Árboles entre casas
      for (let c = 0; c <= D.cols; c++) {
        if (rnd() < 0.55) {
          const tx = c * colW + (rnd() - 0.5) * colW * 0.2;
          svg += arbol(tx, alturaColina(tx) - 2, (0.85 + rnd() * 0.5) * D.escala, rnd);
        }
      }
      // Casas
      for (let c = 0; c < D.cols; c++) {
        const offset = f % 2 ? colW * 0.12 : -colW * 0.08;
        const x = Math.min(D.W - colW * 0.45, Math.max(colW * 0.45, (c + 0.5) * colW + offset + (rnd() - 0.5) * colW * 0.14));
        svg += casa(dias[k++], x, alturaColina(x) + 2, D.escala * (0.95 + rnd() * 0.1), rnd);
      }
    }
    svg += `</svg>`;
    const escena = $("#escena");
    escena.innerHTML = svg;
    escena.querySelectorAll(".casa").forEach((g) => {
      const d = Number(g.dataset.dia);
      g.addEventListener("click", () => abrirDia(d, g));
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDia(d, g); } });
    });
    actualizarEscena();
  }

  function actualizarEscena() {
    document.querySelectorAll(".casa").forEach((g) => {
      const d = Number(g.dataset.dia);
      const hecho = completado(d), abierto = desbloqueado(d);
      g.classList.toggle("completada", hecho);
      g.classList.toggle("disponible", abierto && !hecho);
      g.classList.toggle("bloqueada", !abierto);
      g.classList.toggle("hoy", esHoy(d) && !hecho);
      g.querySelector(".puerta-abierta").setAttribute("opacity", hecho ? "1" : "0");
      g.querySelector(".sello").setAttribute("opacity", hecho ? "1" : "0");
      g.querySelector(".placa").setAttribute("fill", hecho ? "#e7f7ee" : abierto ? "#fff" : "#dfe3ee");
      g.querySelector(".humos").style.display = abierto ? "" : "none";
      g.setAttribute("aria-label", `Día ${d}${hecho ? ", abierto" : abierto ? ", disponible" : ", bloqueado"}`);
    });
    const n = Object.keys(progreso.completados).length;
    $("#progreso-relleno").style.width = (n / 24) * 100 + "%";
    $("#progreso-texto").textContent = `${n} / 24`;
    actualizarPie();
  }

  function actualizarPie() {
    const n = ahora();
    const pie = $("#pie");
    pie.innerHTML = "";
    if (modoPrueba) { pie.textContent = "Modo prueba activo"; return; }
    if (n < fechaDia(1)) {
      const faltan = diasHasta(1);
      pie.append("Faltan ", el("strong", { text: `${faltan} ${faltan === 1 ? "día" : "días"}` }), " para que se encienda la primera casita ✨");
    } else if (n.getFullYear() === C.anio && n.getMonth() === 11 && n.getDate() <= 24) {
      const d = n.getDate();
      pie.append(completado(d) ? `Ya has abierto la casita de hoy. ¡Mañana más! 💫` : el("strong", { text: `Hoy se ha encendido la casita ${d} 🏠✨` }));
    } else {
      pie.append(el("strong", { text: "¡Feliz Navidad! 🎄" }), ` Con cariño, ${C.deQuien}`);
    }
  }

  /* ---------- Modal ---------- */
  const modal = $("#modal"), contenido = $("#modal-contenido");
  let ultimoFoco = null;
  function abrirModal() {
    ultimoFoco = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-caja").scrollTop = 0;
    setTimeout(() => modal.querySelector(".modal-cerrar").focus({ preventScroll: true }), 50);
  }
  function cerrarModal() {
    modal.hidden = true;
    contenido.innerHTML = "";
    document.body.style.overflow = "";
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus({ preventScroll: true });
  }
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-cerrar]")) cerrarModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) cerrarModal(); });

  let temporizadorAviso = 0;
  function aviso(texto) {
    const a = $("#aviso");
    a.textContent = texto;
    a.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => a.classList.remove("visible"), 3200);
  }

  function cabeceraDia(d, datos) {
    return [
      el("span", { class: "dia-etiqueta", text: `${d} de diciembre` }),
      el("h2", { id: "modal-titulo", text: datos.titulo || `Día ${d}` }),
    ];
  }

  function abrirDia(d, nodo) {
    if (!desbloqueado(d)) {
      const faltan = diasHasta(d);
      if (nodo) { nodo.classList.remove("temblor"); void nodo.getBBox(); nodo.classList.add("temblor"); setTimeout(() => nodo.classList.remove("temblor"), 500); }
      aviso(`🔒 ¡Aún no! Esta casita se abre el ${d} de diciembre (${faltan === 1 ? "mañana" : `faltan ${faltan} días`}).`);
      return;
    }
    const datos = datosDia(d);
    contenido.innerHTML = "";
    if (completado(d)) {
      contenido.append(...cabeceraDia(d, datos));
      contenido.append(premio(d, datos));
      abrirModal();
      return;
    }
    contenido.append(...cabeceraDia(d, datos));
    if (datos.intro) contenido.append(el("p", { class: "intro", text: datos.intro }));
    const zona = el("div");
    contenido.append(zona);
    const reto = datos.reto || { tipo: "ninguno" };
    const fallo = window.validarReto(reto);
    abrirModal();
    if (fallo) {
      // Un reto mal configurado no debe bloquear el regalo
      zona.append(el("p", { class: "mensaje-estado error", text: `⚠️ Este reto está mal configurado en contenido.js (día ${d}): ${fallo}` }));
      window.Juegos.ninguno(zona, reto, () => ganar(d));
      return;
    }
    window.Juegos[reto.tipo](zona, reto, () => ganar(d), { pistas: listaPistas(), regaloFinal: C.regaloFinal });
  }

  function ganar(d) {
    progreso.completados[d] = new Date().toISOString();
    guardar();
    actualizarEscena();
    const datos = datosDia(d);
    contenido.innerHTML = "";
    contenido.append(...cabeceraDia(d, datos));
    const caja = el("div", { class: "caja-regalo", role: "button", tabindex: "0", "aria-label": "Abrir el regalo" },
      el("div", { class: "base" }), el("div", { class: "tapa" }, el("div", { class: "lazo" })));
    const texto = el("p", { class: "toca-abrir", text: "¡Reto superado! Toca el regalo para abrirlo 🎁" });
    contenido.append(caja, texto);
    let abierto = false;
    const abrir = () => {
      if (abierto) return;
      abierto = true;
      caja.classList.add("abierta");
      texto.textContent = "";
      setTimeout(() => {
        confeti(d === 24 ? 3 : 1);
        caja.remove(); texto.remove();
        contenido.append(premio(d, datos));
      }, 850);
    };
    caja.addEventListener("click", abrir);
    caja.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), abrir()));
    caja.focus({ preventScroll: true });
  }

  function premio(d, datos) {
    const p = datos.premio || {};
    const cont = el("div", { class: "premio" });
    if ((datos.reto || {}).tipo === "final") {
      const f = C.regaloFinal || {};
      cont.append(el("div", { class: "final-titulo", text: f.titulo || "¡Sorpresa!" }));
      if (f.foto) cont.append(el("img", { class: "foto-premio", src: f.foto, alt: "" }));
      if (f.carta) cont.append(carta(f.carta));
    }
    if (p.carta) cont.append(carta(p.carta));
    if (p.foto) cont.append(el("img", { class: "foto-premio", src: p.foto, alt: "" }));
    if (p.vale) cont.append(el("div", { class: "vale" }, el("small", { text: "Vale canjeable" }), p.vale));
    if (p.enlace && p.enlace.url) cont.append(el("a", { class: "enlace-premio", href: p.enlace.url, target: "_blank", rel: "noopener", text: p.enlace.texto || "Abrir enlace" }));
    if (p.pista) cont.append(el("div", { class: "pista" }, el("small", { text: "🧩 Pista para el gran regalo" }), p.pista));
    if (!cont.children.length) cont.append(el("p", { class: "intro", text: "🎁 ¡Casilla abierta!" }));
    return cont;
  }

  function carta(texto) {
    return el("div", { class: "carta" }, texto, el("span", { class: "firma", text: `— ${C.deQuien} ❤` }));
  }

  function listaPistas() {
    return C.dias.filter((x) => x.premio && x.premio.pista).map((x) => ({ dia: x.dia, texto: x.premio.pista, conseguida: completado(x.dia) }));
  }

  /* ---------- Álbum ---------- */
  function abrirAlbum() {
    contenido.innerHTML = "";
    const n = Object.keys(progreso.completados).length;
    const caja = el("div", { class: "album" });
    caja.append(el("span", { class: "dia-etiqueta", text: `${n} de 24 casitas` }), el("h2", { id: "modal-titulo", text: "Álbum de recuerdos" }));
    const grid = el("div", { class: "album-grid" });
    for (let d = 1; d <= 24; d++) {
      const b = el("button", { type: "button", class: completado(d) ? "hecho" : "", text: String(d), "aria-label": `Día ${d}` });
      b.addEventListener("click", () => {
        if (completado(d)) abrirDia(d);
        else aviso(desbloqueado(d) ? "Esta casita está esperándote en el pueblo 🏠" : `🔒 Se abre el ${d} de diciembre`);
      });
      grid.append(b);
    }
    caja.append(grid);
    const pistas = listaPistas();
    if (pistas.length) {
      caja.append(el("h3", { text: "🧩 Pistas del gran regalo" }));
      const ul = el("ul", { class: "pistas-final" });
      pistas.forEach((p) => ul.append(el("li", { class: p.conseguida ? "" : "falta", text: p.conseguida ? p.texto : `Día ${p.dia}: ???` })));
      caja.append(ul);
    }
    const vales = C.dias.filter((x) => x.premio && x.premio.vale && completado(x.dia));
    if (vales.length) {
      caja.append(el("h3", { text: "🎟️ Tus vales" }));
      const ul = el("ul", { class: "vales-lista" });
      vales.forEach((x) => ul.append(el("li", { class: "vale" }, el("small", { text: `Día ${x.dia}` }), x.premio.vale)));
      caja.append(ul);
    }
    contenido.append(caja);
    abrirModal();
  }

  /* ---------- Nieve ---------- */
  function nieve() {
    const canvas = $("#nieve"), ctx = canvas.getContext("2d");
    let W, H, copos = [];
    const crear = (alAzar) => ({ x: Math.random() * W, y: alAzar ? Math.random() * H : -10, r: 0.8 + Math.random() * 2.6, v: 18 + Math.random() * 40, o: Math.random() * 6, a: 0.4 + Math.random() * 0.6 });
    const medir = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cantidad = reducirMovimiento ? 0 : Math.min(140, Math.round((W * H) / 9000));
      copos = Array.from({ length: cantidad }, () => crear(true));
    };
    medir();
    window.addEventListener("resize", medir);
    if (reducirMovimiento) return;
    let previo = 0;
    const bucle = (t) => {
      const dt = Math.min(0.05, (t - (previo || t)) / 1000); previo = t;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      for (const c of copos) {
        c.y += c.v * dt; c.o += dt; c.x += Math.sin(c.o) * 12 * dt;
        if (c.y > H + 5) Object.assign(c, crear(false));
        ctx.globalAlpha = c.a;
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(bucle);
    };
    requestAnimationFrame(bucle);
  }

  /* ---------- Confeti ---------- */
  function confeti(rafagas = 1) {
    if (reducirMovimiento) return;
    const canvas = $("#confeti"), ctx = canvas.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colores = ["#d7263d", "#ffd36b", "#1f7a4d", "#ffffff", "#5fd3ff", "#ff9ff3"];
    let piezas = [];
    const rafaga = () => {
      for (let i = 0; i < 140; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.6, v = 380 + Math.random() * 520;
        piezas.push({ x: W / 2, y: H * 0.55, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, g: Math.random() * 6, vg: (Math.random() - 0.5) * 12, c: colores[i % colores.length], w: 6 + Math.random() * 6, h: 4 + Math.random() * 6, vida: 3 + Math.random() });
      }
    };
    for (let i = 0; i < rafagas; i++) setTimeout(rafaga, i * 450);
    let previo = 0, inicio = performance.now();
    const bucle = (t) => {
      const dt = Math.min(0.05, (t - (previo || t)) / 1000); previo = t;
      ctx.clearRect(0, 0, W, H);
      piezas.forEach((p) => {
        p.vy += 900 * dt; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt; p.g += p.vg * dt; p.vida -= dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.g); ctx.globalAlpha = Math.max(0, Math.min(1, p.vida));
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.g))); ctx.restore();
      });
      piezas = piezas.filter((p) => p.vida > 0 && p.y < H + 40);
      if (piezas.length || performance.now() - inicio < rafagas * 450 + 100) requestAnimationFrame(bucle);
      else ctx.clearRect(0, 0, W, H);
    };
    requestAnimationFrame(bucle);
  }

  /* ---------- Música ---------- */
  const musica = (function () {
    let audio = null, ac = null, sonando = false, siguiente = 0, paso = 0, temporizador = 0;
    // Melodía original de caja de música (notas MIDI, 0 = silencio)
    const melodia = [76, 79, 84, 83, 79, 76, 74, 76, 72, 0, 74, 76, 77, 81, 79, 77, 76, 74, 72, 74, 76, 79, 84, 83, 81, 79, 77, 76, 74, 72, 71, 72, 0, 0];
    const bajos = [48, 0, 55, 0, 52, 0, 55, 0, 45, 0, 52, 0, 53, 0, 57, 0, 48, 0, 55, 0, 52, 0, 55, 0, 53, 0, 50, 0, 55, 0, 43, 0, 48, 0];
    const tempo = 0.36;
    const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const nota = (m, t, vol, dur) => {
      if (!m) return;
      [1, 2, 3.01].forEach((arm, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = freq(m) * arm;
        const v = vol / (1 + i * 2.5);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
      });
    };
    const programar = () => {
      while (siguiente < ac.currentTime + 0.6) {
        nota(melodia[paso % melodia.length], siguiente, 0.09, 1.6);
        nota(bajos[paso % bajos.length], siguiente, 0.05, 2.2);
        siguiente += tempo; paso++;
      }
    };
    return {
      alternar() {
        if (C.musica) {
          if (!audio) { audio = new Audio(C.musica); audio.loop = true; audio.volume = 0.6; }
          sonando = !sonando;
          sonando ? audio.play().catch(() => { sonando = false; aviso("No se pudo reproducir la música"); actualizarBoton(); }) : audio.pause();
        } else {
          ac = ac || new (window.AudioContext || window.webkitAudioContext)();
          sonando = !sonando;
          if (sonando) { ac.resume(); siguiente = ac.currentTime + 0.1; programar(); temporizador = setInterval(programar, 200); }
          else { clearInterval(temporizador); ac.suspend(); }
        }
        actualizarBoton();
      },
      get sonando() { return sonando; },
    };
    function actualizarBoton() { $("#btn-musica").classList.toggle("activo", sonando); }
  })();

  /* ---------- Inicio ---------- */
  function iniciar() {
    document.title = C.titulo || "Calendario de Adviento";
    $("#titulo").textContent = C.titulo || "Calendario de Adviento";
    $("#subtitulo").textContent = (C.paraQuien ? `Para ${C.paraQuien}. ` : "") + (C.bienvenida || "");
    if (modoPrueba) {
      $("#banner-prueba").hidden = false;
      $("#btn-reset").addEventListener("click", () => { progreso = { completados: {} }; guardar(); actualizarEscena(); aviso("Progreso de prueba borrado"); });
      $("#btn-salir-prueba").addEventListener("click", () => { localStorage.removeItem(CLAVE_PRUEBA); location.reload(); });
    }
    $("#btn-album").addEventListener("click", abrirAlbum);
    $("#btn-musica").addEventListener("click", () => musica.alternar());
    dibujarEscena();
    nieve();
    let t = 0;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => { if (disposicion().id !== disposicionActual) dibujarEscena(); }, 200);
    });
    // Si la web se queda abierta a medianoche, se enciende la casita nueva
    setInterval(actualizarEscena, 60 * 1000);
    document.addEventListener("visibilitychange", () => !document.hidden && actualizarEscena());
  }

  iniciar();
})();
