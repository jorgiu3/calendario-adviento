/* Minijuegos del calendario. Cada juego recibe (contenedor, reto, alGanar, ctx). */
(function () {
  "use strict";

  const normalizar = (t) =>
    String(t ?? "")
      .toLowerCase()
      .normalize("NFD").replace(/(?!̃)[̀-ͯ]/g, "") // quita tildes pero conserva la ñ
      .normalize("NFC")
      .replace(/[¿?¡!.,;:'"()\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const letrasMayus = (t) =>
    String(t ?? "")
      .toUpperCase()
      .normalize("NFD").replace(/(?!̃)[̀-ͯ]/g, "").normalize("NFC")
      .replace(/[^A-ZÑ]/g, "");

  const lista = (v) => (Array.isArray(v) ? v : [v]);
  const esCorrecta = (respuesta, validas) => {
    const r = normalizar(respuesta);
    return r.length > 0 && lista(validas).some((v) => normalizar(v) === r || normalizar(v).replace(/ /g, "") === r.replace(/ /g, ""));
  };

  const barajar = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const el = (tag, attrs = {}, ...hijos) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    hijos.flat().forEach((h) => h != null && e.append(h));
    return e;
  };

  const esImagen = (s) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(String(s)) || String(s).startsWith("data:image");

  function sacudir(nodo) {
    nodo.classList.remove("sacudir");
    void nodo.offsetWidth;
    nodo.classList.add("sacudir");
  }

  /* Campo de respuesta reutilizable */
  function campoRespuesta(cont, validas, alGanar, opciones = {}) {
    const input = el("input", { type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false", placeholder: opciones.placeholder || "Escribe tu respuesta" });
    const boton = el("button", { class: "btn verde", type: "submit", text: "Comprobar" });
    const estado = el("p", { class: "mensaje-estado" });
    let fallos = 0;
    const form = el("form", { class: "campo" }, input, boton);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (esCorrecta(input.value, validas)) {
        estado.className = "mensaje-estado ok";
        estado.textContent = "¡Correcto! 🎉";
        input.disabled = boton.disabled = true;
        setTimeout(alGanar, 700);
      } else {
        fallos++;
        estado.className = "mensaje-estado error";
        estado.textContent = fallos >= 2 && opciones.ayuda ? "Pista: " + opciones.ayuda : "Mmm… no es eso. ¡Inténtalo otra vez!";
        sacudir(form);
      }
    });
    cont.append(form, estado);
    setTimeout(() => window.matchMedia("(pointer: fine)").matches && input.focus(), 350);
  }

  const Juegos = {};

  /* ---------- Quiz ---------- */
  Juegos.quiz = (cont, reto, alGanar) => {
    const preguntas = reto.preguntas || [];
    let i = 0;
    const caja = el("div");
    cont.append(caja);
    const pintar = () => {
      const p = preguntas[i];
      caja.innerHTML = "";
      if (preguntas.length > 1) caja.append(el("div", { class: "quiz-contador", text: `Pregunta ${i + 1} de ${preguntas.length}` }));
      caja.append(el("p", { class: "quiz-pregunta", text: p.pregunta }));
      const ops = el("div", { class: "quiz-opciones" });
      const estado = el("p", { class: "mensaje-estado" });
      p.opciones.forEach((op, idx) => {
        const b = el("button", { type: "button", text: op });
        b.addEventListener("click", () => {
          if (idx === p.correcta) {
            b.classList.add("bien");
            ops.querySelectorAll("button").forEach((x) => (x.disabled = true));
            estado.className = "mensaje-estado ok";
            estado.textContent = "¡Correcto! 💚";
            setTimeout(() => (++i < preguntas.length ? pintar() : alGanar()), 800);
          } else {
            b.classList.remove("mal"); void b.offsetWidth; b.classList.add("mal");
            estado.className = "mensaje-estado error";
            estado.textContent = "¡Casi! Prueba otra vez 😉";
          }
        });
        ops.append(b);
      });
      caja.append(ops, estado);
    };
    if (preguntas.length) pintar(); else alGanar();
  };

  /* ---------- Adivinanza / código ---------- */
  Juegos.adivinanza = (cont, reto, alGanar) => {
    cont.append(el("p", { class: "quiz-pregunta", text: reto.pregunta || "" }));
    campoRespuesta(cont, reto.respuesta, alGanar, { ayuda: reto.ayuda });
  };

  Juegos.codigo = (cont, reto, alGanar) => {
    cont.append(el("p", { class: "quiz-pregunta", text: "🔎 " + (reto.instrucciones || "Busca el código escondido.") }));
    campoRespuesta(cont, reto.codigo, alGanar, { placeholder: "Código secreto", ayuda: reto.ayuda });
  };

  /* ---------- Puzle ---------- */
  function recortarCuadrado(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const lado = Math.min(img.naturalWidth || 600, img.naturalHeight || 600);
          const c = document.createElement("canvas");
          c.width = c.height = Math.min(900, lado || 600);
          const ctx = c.getContext("2d");
          const sx = ((img.naturalWidth || lado) - lado) / 2;
          const sy = ((img.naturalHeight || lado) - lado) / 2;
          ctx.drawImage(img, sx, sy, lado, lado, 0, 0, c.width, c.height);
          resolve(c.toDataURL("image/jpeg", 0.88));
        } catch (e) {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  }

  Juegos.puzle = async (cont, reto, alGanar) => {
    const n = Math.max(2, Math.min(5, reto.piezas || 3));
    const src = await recortarCuadrado(reto.foto);
    cont.append(el("img", { class: "ref-puzle", src, alt: "Referencia" }));
    const tablero = el("div", { class: "puzle" });
    tablero.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    let orden = [...Array(n * n).keys()];
    do { orden = barajar(orden); } while (orden.every((v, i) => v === i));
    let sel = null;
    const pintar = () => {
      tablero.innerHTML = "";
      orden.forEach((pieza, pos) => {
        const b = el("div", { class: "pieza", role: "button", tabindex: "0", "aria-label": `Pieza ${pos + 1}` });
        b.style.backgroundImage = `url("${src}")`;
        b.style.backgroundSize = `${n * 100}% ${n * 100}%`;
        b.style.backgroundPosition = `${((pieza % n) / (n - 1)) * 100}% ${(Math.floor(pieza / n) / (n - 1)) * 100}%`;
        if (sel === pos) b.classList.add("sel");
        const tocar = () => {
          if (sel === null) { sel = pos; pintar(); return; }
          [orden[sel], orden[pos]] = [orden[pos], orden[sel]];
          sel = null;
          pintar();
          if (orden.every((v, i) => v === i)) {
            tablero.classList.add("resuelto");
            setTimeout(alGanar, 900);
          }
        };
        b.addEventListener("click", tocar);
        b.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), tocar()));
        tablero.append(b);
      });
    };
    pintar();
    cont.append(tablero);
  };

  /* ---------- Memoria ---------- */
  Juegos.memoria = (cont, reto, alGanar) => {
    const base = (reto.cartas && reto.cartas.length ? reto.cartas : ["🎄", "⛄", "🎁", "🦌", "⭐", "🍪"]).slice(0, 10);
    const cartas = barajar([...base, ...base].map((v, i) => ({ v, id: i })));
    const grid = el("div", { class: "memoria" });
    if (cartas.length <= 8) grid.style.gridTemplateColumns = "repeat(4, 1fr)";
    let abiertas = [], hechas = 0, bloqueo = false;
    cartas.forEach((c) => {
      const frente = esImagen(c.v) ? el("img", { src: c.v, alt: "" }) : c.v;
      const b = el("button", { class: "carta-mem", type: "button", "aria-label": "Carta" },
        el("div", { class: "giro" }, el("div", { class: "cara dorso", text: "❄" }), el("div", { class: "cara frente" }, frente)));
      b.addEventListener("click", () => {
        if (bloqueo || b.classList.contains("vuelta") || b.classList.contains("hecha")) return;
        b.classList.add("vuelta");
        abiertas.push({ b, c });
        if (abiertas.length === 2) {
          const [x, y] = abiertas;
          if (x.c.v === y.c.v) {
            x.b.classList.add("hecha"); y.b.classList.add("hecha");
            abiertas = [];
            hechas++;
            if (hechas === base.length) setTimeout(alGanar, 700);
          } else {
            bloqueo = true;
            setTimeout(() => { x.b.classList.remove("vuelta"); y.b.classList.remove("vuelta"); abiertas = []; bloqueo = false; }, 850);
          }
        }
      });
      grid.append(b);
    });
    cont.append(grid);
  };

  /* ---------- Sopa de letras ---------- */
  function generarSopa(palabras, tam) {
    const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]];
    for (let intento = 0; intento < 200; intento++) {
      const g = Array.from({ length: tam }, () => Array(tam).fill(""));
      const pos = {};
      let ok = true;
      for (const p of palabras.slice().sort((a, b) => b.length - a.length)) {
        let puesta = false;
        for (let t = 0; t < 300 && !puesta; t++) {
          const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
          const r0 = Math.floor(Math.random() * tam), c0 = Math.floor(Math.random() * tam);
          const r1 = r0 + dr * (p.length - 1), c1 = c0 + dc * (p.length - 1);
          if (r1 < 0 || r1 >= tam || c1 < 0 || c1 >= tam) continue;
          let cabe = true;
          for (let k = 0; k < p.length; k++) {
            const ch = g[r0 + dr * k][c0 + dc * k];
            if (ch && ch !== p[k]) { cabe = false; break; }
          }
          if (!cabe) continue;
          for (let k = 0; k < p.length; k++) g[r0 + dr * k][c0 + dc * k] = p[k];
          pos[p] = { r0, c0, r1, c1 };
          puesta = true;
        }
        if (!puesta) { ok = false; break; }
      }
      if (!ok) continue;
      for (const fila of g) for (let c = 0; c < tam; c++) if (!fila[c]) fila[c] = ABC[Math.floor(Math.random() * ABC.length)];
      return { g, pos };
    }
    return null;
  }

  Juegos.sopa = (cont, reto, alGanar) => {
    const palabras = (reto.palabras || []).map(letrasMayus).filter(Boolean);
    const larga = Math.max(...palabras.map((p) => p.length), 6);
    let tam = Math.max(reto.tamano || 9, larga);
    let sopa = generarSopa(palabras, tam);
    while (!sopa && tam < 16) sopa = generarSopa(palabras, ++tam);
    const grid = el("div", { class: "sopa" });
    grid.style.gridTemplateColumns = `repeat(${tam}, 1fr)`;
    const celdas = [];
    const lista = el("ul", { class: "sopa-palabras" });
    const items = {};
    palabras.forEach((p) => { items[p] = el("li", { text: p }); lista.append(items[p]); });
    const encontradas = new Set();
    let inicio = null;

    const celda = (r, c) => celdas[r * tam + c];
    const camino = (a, b) => {
      const dr = Math.sign(b.r - a.r), dc = Math.sign(b.c - a.c);
      const lr = Math.abs(b.r - a.r), lc = Math.abs(b.c - a.c);
      if (!(lr === 0 || lc === 0 || lr === lc)) return null;
      const len = Math.max(lr, lc) + 1;
      return Array.from({ length: len }, (_, k) => ({ r: a.r + dr * k, c: a.c + dc * k }));
    };

    sopa.g.forEach((fila, r) => fila.forEach((ch, c) => {
      const b = el("button", { type: "button", text: ch });
      b.addEventListener("click", () => {
        if (!inicio) { inicio = { r, c }; b.classList.add("sel"); return; }
        const cam = camino(inicio, { r, c });
        celda(inicio.r, inicio.c).classList.remove("sel");
        const ini = inicio;
        inicio = null;
        if (!cam || (ini.r === r && ini.c === c)) return;
        const texto = cam.map((p) => sopa.g[p.r][p.c]).join("");
        const reves = texto.split("").reverse().join("");
        const p = palabras.find((w) => !encontradas.has(w) && (w === texto || w === reves));
        if (p) {
          encontradas.add(p);
          cam.forEach((q) => celda(q.r, q.c).classList.add("encontrada"));
          items[p].classList.add("hecha");
          if (encontradas.size === palabras.length) setTimeout(alGanar, 700);
        } else {
          cam.forEach((q) => celda(q.r, q.c).classList.add("sel"));
          setTimeout(() => cam.forEach((q) => celda(q.r, q.c).classList.remove("sel")), 350);
        }
      });
      celdas.push(b);
      grid.append(b);
    }));
    cont.append(grid, lista);
  };

  /* ---------- Rasca y gana ---------- */
  Juegos.rasca = (cont, reto, alGanar) => {
    const zona = el("div", { class: "rasca" }, el("div", { class: "rasca-premio", text: reto.texto || "🎁 ¡Premio!" }));
    const canvas = el("canvas");
    zona.append(canvas);
    cont.append(zona, el("p", { class: "mensaje-estado", text: "👆 Rasca con el dedo" }));
    let ganado = false, rascando = false, cuenta = 0;
    requestAnimationFrame(() => {
      const r = zona.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      const grad = ctx.createLinearGradient(0, 0, r.width, r.height);
      grad.addColorStop(0, "#c9ccd6"); grad.addColorStop(0.5, "#eef0f5"); grad.addColorStop(1, "#aab0bf");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, r.width, r.height);
      ctx.fillStyle = "rgba(90,98,120,.55)";
      ctx.font = "bold 22px Nunito, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (let y = 20; y < r.height; y += 46) for (let x = 20; x < r.width + 40; x += 60) ctx.fillText("❄", x + (y % 92 ? 30 : 0), y);
      ctx.font = "800 20px Nunito, sans-serif"; ctx.fillStyle = "#5a6278";
      ctx.fillText("¡RASCA AQUÍ!", r.width / 2, r.height / 2);
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = ctx.lineJoin = "round"; ctx.lineWidth = 34;
      let ultimo = null;
      const punto = (e) => { const b = canvas.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
      const comprobar = () => {
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let vacio = 0, total = 0;
        for (let i = 3; i < d.length; i += 4 * 37) { total++; if (d[i] < 128) vacio++; }
        if (vacio / total > 0.55 && !ganado) {
          ganado = true;
          canvas.style.transition = "opacity .6s"; canvas.style.opacity = "0";
          setTimeout(alGanar, 1100);
        }
      };
      canvas.addEventListener("pointerdown", (e) => { rascando = true; ultimo = punto(e); canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener("pointermove", (e) => {
        if (!rascando) return;
        const p = punto(e);
        ctx.beginPath(); ctx.moveTo(ultimo.x, ultimo.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        ultimo = p;
        if (++cuenta % 8 === 0) comprobar();
      });
      const fin = () => { if (rascando) { rascando = false; comprobar(); } };
      canvas.addEventListener("pointerup", fin);
      canvas.addEventListener("pointercancel", fin);
    });
  };

  /* ---------- Mensaje cifrado ---------- */
  Juegos.cifrado = (cont, reto, alGanar) => {
    const ABC = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    const n = reto.desplazamiento || 3;
    const limpio = String(reto.mensaje || "").toUpperCase().normalize("NFD").replace(/(?!̃)[̀-ͯ]/g, "").normalize("NFC");
    const cifrado = limpio.split("").map((ch) => {
      const i = ABC.indexOf(ch);
      return i < 0 ? ch : ABC[(i + n) % ABC.length];
    }).join("");
    cont.append(el("div", { class: "cifrado-texto", text: cifrado }));
    const fila1 = el("tr"), fila2 = el("tr");
    ABC.split("").forEach((ch, i) => { fila1.append(el("td", { text: ABC[(i + n) % ABC.length] })); fila2.append(el("td", { text: ch })); });
    cont.append(el("div", { class: "rueda" }, el("table", {}, fila1, fila2)));
    cont.append(el("p", { class: "rueda-ayuda", text: `Cada letra está ${n} posiciones más adelante en el abecedario. Busca la letra de arriba y mira la de abajo.` }));
    campoRespuesta(cont, reto.respuesta || reto.mensaje, alGanar, { placeholder: "Mensaje descifrado" });
  };

  /* ---------- Atrapa copos ---------- */
  Juegos.copos = (cont, reto, alGanar) => {
    const objetivo = reto.objetivo || 15, segundos = reto.segundos || 25;
    const info = el("div", { class: "copos-info" });
    const marcador = el("span", { text: `❄ 0 / ${objetivo}` });
    const reloj = el("span", { text: `⏱ ${segundos}s` });
    info.append(marcador, reloj);
    const zona = el("div", { class: "copos" });
    const canvas = el("canvas");
    const cubierta = el("div", { class: "copos-cubierta" },
      el("div", { style: "font-size:42px", text: "❄️" }),
      el("div", { text: `Atrapa ${objetivo} copos en ${segundos} segundos` }));
    const btn = el("button", { class: "btn", type: "button", text: "¡Empezar!" });
    cubierta.append(btn);
    zona.append(canvas, cubierta);
    cont.append(info, zona);

    let copos = [], puntos = 0, fin = 0, raf = 0, jugando = false, ultimo = 0, chispas = [];
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0;
    const medir = () => {
      const r = zona.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const nuevo = () => ({ x: 20 + Math.random() * (W - 40), y: -20, r: 14 + Math.random() * 10, v: 55 + Math.random() * 70 + puntos * 2, giro: Math.random() * 6, vg: (Math.random() - .5) * 2, osc: Math.random() * 6 });
    const dibujarCopo = (c) => {
      ctx.save(); ctx.translate(c.x + Math.sin(c.osc) * 8, c.y); ctx.rotate(c.giro);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.4; ctx.lineCap = "round";
      ctx.shadowColor = "rgba(180,220,255,.9)"; ctx.shadowBlur = 8;
      for (let k = 0; k < 6; k++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, c.r);
        ctx.moveTo(0, c.r * .55); ctx.lineTo(c.r * .25, c.r * .75);
        ctx.moveTo(0, c.r * .55); ctx.lineTo(-c.r * .25, c.r * .75);
        ctx.stroke();
      }
      ctx.restore();
    };
    const bucle = (t) => {
      if (!zona.isConnected) { cancelAnimationFrame(raf); return; }
      const dt = Math.min(0.05, (t - (ultimo || t)) / 1000); ultimo = t;
      ctx.clearRect(0, 0, W, H);
      if (Math.random() < dt * 2.6 && copos.length < 9) copos.push(nuevo());
      copos.forEach((c) => { c.y += c.v * dt; c.giro += c.vg * dt; c.osc += dt * 2; });
      copos = copos.filter((c) => c.y < H + 30);
      copos.forEach(dibujarCopo);
      chispas.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; s.vida -= dt; });
      chispas = chispas.filter((s) => s.vida > 0);
      chispas.forEach((s) => { ctx.globalAlpha = Math.max(0, s.vida * 2); ctx.fillStyle = "#ffd36b"; ctx.beginPath(); ctx.arc(s.x, s.y, 3, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1;
      const quedan = Math.max(0, Math.ceil((fin - performance.now()) / 1000));
      reloj.textContent = `⏱ ${quedan}s`;
      if (quedan <= 0) { terminar(false); return; }
      raf = requestAnimationFrame(bucle);
    };
    const terminar = (gano) => {
      jugando = false; cancelAnimationFrame(raf);
      if (gano) {
        cubierta.innerHTML = "";
        cubierta.append(el("div", { style: "font-size:42px", text: "🎉" }), el("div", { text: "¡Lo conseguiste!" }));
        cubierta.hidden = false;
        setTimeout(alGanar, 900);
      } else {
        cubierta.innerHTML = "";
        cubierta.append(el("div", { style: "font-size:42px", text: "⏰" }), el("div", { text: `¡Se acabó el tiempo! Llevabas ${puntos}.` }), btn);
        btn.textContent = "Reintentar";
        cubierta.hidden = false;
      }
    };
    btn.addEventListener("click", () => {
      medir(); copos = []; chispas = []; puntos = 0; ultimo = 0;
      marcador.textContent = `❄ 0 / ${objetivo}`;
      fin = performance.now() + segundos * 1000; jugando = true; cubierta.hidden = true;
      raf = requestAnimationFrame(bucle);
    });
    canvas.addEventListener("pointerdown", (e) => {
      if (!jugando) return;
      const b = canvas.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      const i = copos.findIndex((c) => Math.hypot(c.x + Math.sin(c.osc) * 8 - x, c.y - y) < c.r + 16);
      if (i >= 0) {
        const c = copos.splice(i, 1)[0];
        for (let k = 0; k < 10; k++) chispas.push({ x: c.x, y: c.y, vx: (Math.random() - .5) * 220, vy: (Math.random() - .5) * 220, vida: .5 });
        puntos++;
        marcador.textContent = `❄ ${puntos} / ${objetivo}`;
        if (puntos >= objetivo) terminar(true);
      }
    });
  };

  /* ---------- Ahorcado ---------- */
  Juegos.ahorcado = (cont, reto, alGanar) => {
    const original = String(reto.palabra || "NAVIDAD").toUpperCase().normalize("NFD").replace(/(?!̃)[̀-ͯ]/g, "").normalize("NFC");
    const VIDAS = 7;
    if (reto.ayuda) cont.append(el("p", { class: "quiz-pregunta", text: "💡 " + reto.ayuda }));
    const vidas = el("div", { class: "ahorcado-vidas" });
    const palabra = el("div", { class: "ahorcado-palabra" });
    const teclado = el("div", { class: "teclado" });
    const estado = el("p", { class: "mensaje-estado" });
    cont.append(vidas, palabra, teclado, estado);
    let usadas, fallos;
    const empezar = () => {
      usadas = new Set(); fallos = 0;
      teclado.innerHTML = ""; estado.textContent = "";
      "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("").forEach((l) => {
        const b = el("button", { type: "button", text: l });
        b.addEventListener("click", () => jugar(l, b));
        teclado.append(b);
      });
      pintar();
    };
    const pintar = () => {
      vidas.textContent = "❤️".repeat(VIDAS - fallos) + "🤍".repeat(fallos);
      palabra.innerHTML = "";
      original.split("").forEach((ch) => {
        if (ch === " ") palabra.append(el("span", { class: "hueco" }));
        else palabra.append(el("span", { text: /[A-ZÑ]/.test(ch) && !usadas.has(ch) ? "" : ch }));
      });
    };
    const jugar = (l, b) => {
      if (usadas.has(l) || fallos >= VIDAS) return;
      usadas.add(l); b.disabled = true;
      if (original.includes(l)) b.classList.add("si"); else { b.classList.add("no"); fallos++; sacudir(vidas); }
      pintar();
      const completa = original.split("").every((ch) => !/[A-ZÑ]/.test(ch) || usadas.has(ch));
      if (completa) {
        estado.className = "mensaje-estado ok"; estado.textContent = "¡Correcto! 🎉";
        teclado.querySelectorAll("button").forEach((x) => (x.disabled = true));
        setTimeout(alGanar, 900);
      } else if (fallos >= VIDAS) {
        estado.className = "mensaje-estado error"; estado.innerHTML = "";
        estado.append("¡Oh, no! ", el("button", { class: "btn secundario", type: "button", text: "Probar otra vez", onclick: empezar }));
        teclado.querySelectorAll("button").forEach((x) => (x.disabled = true));
      }
    };
    empezar();
  };

  /* ---------- Ordenar ---------- */
  Juegos.ordenar = (cont, reto, alGanar) => {
    const elementos = reto.elementos || [];
    const caja = el("div", { class: "ordenar" });
    const estado = el("p", { class: "mensaje-estado" });
    let siguiente = 0;
    let mezcla = barajar(elementos.map((t, i) => ({ t, i })));
    if (elementos.length > 1) while (mezcla.every((x, k) => x.i === k)) mezcla = barajar(mezcla);
    const botones = mezcla.map((x) => {
      const num = el("span", { class: "num", text: "" });
      const b = el("button", { type: "button" }, num, x.t);
      b.addEventListener("click", () => {
        if (b.classList.contains("hecho")) return;
        if (x.i === siguiente) {
          b.classList.add("hecho"); num.textContent = ++siguiente;
          estado.textContent = "";
          if (siguiente === elementos.length) { estado.className = "mensaje-estado ok"; estado.textContent = "¡Perfecto! 🎉"; setTimeout(alGanar, 800); }
        } else {
          siguiente = 0;
          botones.forEach((o) => { o.b.classList.remove("hecho"); o.num.textContent = ""; });
          estado.className = "mensaje-estado error"; estado.textContent = "Ese no iba ahí… ¡vuelve a empezar!";
          sacudir(caja);
        }
      });
      caja.append(b);
      return { b, num };
    });
    cont.append(caja, estado);
  };

  /* ---------- Sin reto ---------- */
  Juegos.ninguno = (cont, reto, alGanar) => {
    cont.append(el("div", { class: "centrado" }, el("button", { class: "btn verde", type: "button", text: "Abrir mi regalo", onclick: alGanar })));
  };

  /* ---------- Final (día 24) ---------- */
  Juegos.final = (cont, reto, alGanar, ctx) => {
    const final = ctx.regaloFinal || {};
    cont.append(el("h3", { text: "🧩 Tus pistas" }));
    const ul = el("ul", { class: "pistas-final" });
    ctx.pistas.forEach((p) => ul.append(el("li", { class: p.conseguida ? "" : "falta", text: p.conseguida ? p.texto : `Día ${p.dia}: pista sin descubrir` })));
    cont.append(ul);
    cont.append(el("p", { class: "quiz-pregunta", text: final.pregunta || "¿Cuál es el gran regalo?" }));
    campoRespuesta(cont, final.respuesta, alGanar, { ayuda: final.ayuda });
  };

  window.Juegos = Juegos;
  window.JuegosUtil = { normalizar, esCorrecta, el, esImagen, barajar };
})();
