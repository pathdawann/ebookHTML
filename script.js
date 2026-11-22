const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// Sanitizador para vistas previas
function clean(h) {
  const d = new DOMParser().parseFromString(h, "text/html");
  d.querySelectorAll("script,iframe,object,embed,link,meta,style,form").forEach((n) => n.remove());
  d.body.querySelectorAll("*").forEach((n) =>
    [...n.attributes].forEach((a) => {
      if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);
    })
  );
  return d.body.innerHTML;
}

// 1. Editor en vivo + botón de reinicio
const ed = $("#ed");
const initialCode = ed.value;
const updatePreview = () => ($("#ov").innerHTML = clean(ed.value));
ed.addEventListener("input", updatePreview);
$("#ed-reset").addEventListener("click", () => {
  ed.value = initialCode;
  updatePreview();
});
updatePreview();

// 2. Pestañas HTML / CSS / JS
$$("[data-tab]").forEach((b) =>
  b.addEventListener("click", () => {
    $$("[data-tab]").forEach((x) => x.classList.toggle("on", x === b));
    $$(".panel").forEach((p) => p.classList.toggle("on", p.id === b.dataset.tab));
  })
);

// 3. Animación paso a paso
let tm;
$("#go").addEventListener("click", () => {
  const s = $$(".step");
  clearInterval(tm);
  let i = 0;
  s.forEach((x) => x.classList.remove("on"));
  tm = setInterval(() => {
    s.forEach((x, j) => x.classList.toggle("on", j === i));
    if (++i > s.length) clearInterval(tm);
  }, 900);
});

// 4. Anatomía de elemento y Semántica
$$("#an button").forEach((b) =>
  b.addEventListener("click", () => ($("#an-n").textContent = b.dataset.k))
);

$$("#ly button").forEach((b) =>
  b.addEventListener("click", () => {
    $$("#ly button").forEach((x) => x.classList.toggle("on", x === b));
    $("#ly-n").textContent = b.dataset.k;
  })
);

// 5. Explorador de etiquetas
const T = [
  ["h1–h6", "Títulos jerárquicos. Usa un solo h1 por página y no saltes niveles.", "<h1>Recetas</h1>\n<h2>Postres</h2>\n<h3>Flan</h3>"],
  ["p", "Párrafo: un bloque de texto con márgenes automáticos.", "<p>Un párrafo de ejemplo.</p>"],
  ["a", "Enlace. href indica el destino; target=\"_blank\" abre pestaña nueva (añade rel=\"noopener noreferrer\").", "<a href=\"#t1\">Ir al capítulo 1</a>"],
  ["img", "Imagen (elemento vacío). Siempre con alt descriptivo, width y height.", "<img src=\"gato.jpg\" alt=\"Gatito naranja\" width=\"120\" height=\"80\">"],
  ["ul · ol · li", "Listas sin orden (ul) o numeradas (ol). Cada ítem va en un li.", "<ol>\n  <li>Despertar</li>\n  <li>Programar</li>\n</ol>"],
  ["strong · em", "strong indica importancia; em indica énfasis.", "<p>Esto es <strong>clave</strong> y esto <em>enfatizado</em>.</p>"],
  ["table", "Datos tabulares: tr filas, th encabezados, td celdas. Nunca para maquetar.", "<table>\n  <tr><th>Curso</th><th>Precio</th></tr>\n  <tr><td>HTML</td><td>$30</td></tr>\n</table>"],
  ["button", "Botón interactivo. Indica siempre su type.", "<button type=\"button\">Haz clic</button>"],
  ["input · label", "Campos de formulario. label for debe coincidir con el id del campo.", "<label for=\"n\">Nombre</label>\n<input type=\"text\" id=\"n\" placeholder=\"Tu nombre\">"],
  ["details", "Acordeón nativo, sin JavaScript.", "<details>\n  <summary>¿Qué es HTML?</summary>\n  <p>El esqueleto de la web.</p>\n</details>"],
  ["br · hr", "br salta de línea dentro de un bloque; hr marca un cambio de tema.", "<p>Calle 8<br>Miami</p>\n<hr>\n<p>Otro tema</p>"],
  ["div · span", "Contenedores genéricos: div en bloque, span en línea. Úsalos si no hay etiqueta semántica.", "<div><p>Dentro de un <span>span</span></p></div>"]
];

function pick(i) {
  $$("#chips .chip").forEach((c, j) => c.classList.toggle("on", i === j));
  const [, d, x] = T[i];
  $("#tg-d").textContent = d;
  $("#tg-c").textContent = x;
  $("#tg-o").innerHTML = clean(x);
}

T.forEach((t, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.textContent = t[0];
  b.addEventListener("click", () => pick(i));
  $("#chips").append(b);
});
pick(0);

// 6. Checklist persistente con localStorage
const K = [
  "Empiezo con doctype, lang y charset",
  "Uso etiquetas semánticas antes que div",
  "Todas mis imágenes llevan alt",
  "Cada campo tiene su label",
  "Indento con 2 o 4 espacios siempre igual",
  "Valido mi código en validator.w3.org"
];

const savedChecks = JSON.parse(localStorage.getItem("html_guide_checks") || "[]");

function updateMeter() {
  const inputs = $$("#ckl input");
  const checkedIndices = inputs.map((inp, idx) => (inp.checked ? idx : -1)).filter((idx) => idx !== -1);
  localStorage.setItem("html_guide_checks", JSON.stringify(checkedIndices));
  const n = checkedIndices.length;
  $("#mt").style.width = (n / K.length) * 100 + "%";
  $("#mt-t").textContent = n + " de " + K.length + (n === K.length ? " · ¡excelente!" : "");
}

K.forEach((k, idx) => {
  const l = document.createElement("label");
  l.className = "ck";
  const inp = document.createElement("input");
  inp.type = "checkbox";
  inp.checked = savedChecks.includes(idx);
  const sp = document.createElement("span");
  sp.textContent = k;
  l.append(inp, sp);
  $("#ckl").append(l);
});
$("#ckl").addEventListener("change", updateMeter);
updateMeter();

// 7. Quiz interactivo con persistencia y reinicio
const Q = [
  ["¿Qué hace el atributo alt?", ["Cambia el tamaño", "Describe la imagen", "Enlaza a otra página"], 1],
  ["¿Cuántos h1 conviene usar por página?", ["Uno", "Seis", "Ninguno"], 0],
  ["¿Cuál es un elemento vacío?", ["p", "img", "div"], 1],
  ["¿Qué etiqueta contiene el contenido principal?", ["main", "aside", "footer"], 0],
  ["¿Qué es HTML?", ["Un lenguaje de programación", "Un lenguaje de marcado", "Una base de datos"], 1],
  ["¿Qué vincula un label con su campo?", ["for = id", "name = class", "href = src"], 0],
  ["¿Qué contraste mínimo pide el nivel AA para texto normal?", ["2:1", "4,5:1", "10:1"], 1]
];

function renderQuiz() {
  const qz = $("#qz");
  qz.innerHTML = "";
  $("#qs").textContent = "";
  const savedAnswers = JSON.parse(localStorage.getItem("html_guide_quiz") || "{}");
  let sc = 0;
  let an = 0;

  const updateScore = () => {
    if (an > 0) $("#qz-reset").hidden = false;
    if (an === Q.length) {
      $("#qs").textContent = "Resultado: " + sc + " de " + Q.length + (sc === Q.length ? " · ¡perfecto!" : "");
    }
  };

  Q.forEach(([q, o, r], qIdx) => {
    const w = document.createElement("div");
    w.className = "mt-16";
    const p = document.createElement("b");
    p.textContent = q;
    w.append(p);

    const applyAnswer = (chosenIdx) => {
      if (w.dataset.d) return;
      w.dataset.d = "1";
      an++;
      const buttons = [...w.querySelectorAll("button")];
      buttons.forEach((btn) => (btn.disabled = true));
      if (chosenIdx === r) {
        sc++;
        buttons[chosenIdx].classList.add("ok");
      } else {
        buttons[chosenIdx].classList.add("no");
        buttons[r].classList.add("ok");
      }
      savedAnswers[qIdx] = chosenIdx;
      localStorage.setItem("html_guide_quiz", JSON.stringify(savedAnswers));
      updateScore();
    };

    o.forEach((t, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opt";
      b.textContent = t;
      b.addEventListener("click", () => applyAnswer(i));
      w.append(b);
    });

    qz.append(w);
    if (savedAnswers[qIdx] !== undefined) {
      applyAnswer(savedAnswers[qIdx]);
    }
  });
}

$("#qz-reset").addEventListener("click", () => {
  localStorage.removeItem("html_guide_quiz");
  $("#qz-reset").hidden = true;
  renderQuiz();
});
renderQuiz();

// 8. Formulario de ejemplo
const FS = `<form action="/enviar" method="POST">
  <label for="nm">Nombre</label>
  <input type="text" id="nm" name="nombre" required minlength="2" autocomplete="name">
  <label for="em">Correo</label>
  <input type="email" id="em" name="correo" required autocomplete="email">
  <label for="ag">Edad</label>
  <input type="number" id="ag" name="edad" min="12" max="99">
  <label for="pa">País</label>
  <select id="pa" name="pais">
    <option value="">Elige uno</option>
    <option>Venezuela</option>
    <option>México</option>
    <option>Colombia</option>
    <option>España</option>
  </select>
  <fieldset>
    <legend>Contacto preferido</legend>
    <label><input type="radio" name="via" value="correo" checked> Correo</label>
    <label><input type="radio" name="via" value="tel"> Teléfono</label>
  </fieldset>
  <label for="ms">Mensaje</label>
  <textarea id="ms" name="mensaje" rows="3"></textarea>
  <label><input type="checkbox" name="ok" required> Acepto los términos</label>
  <button type="submit">Enviar</button>
</form>`;

$("#fm-c").textContent = FS;
$("#fm-w").innerHTML = FS;
$("#fm-w form").className = "frm";
$$("#fm-w button").forEach((b) => b.classList.add("btn"));
$("#fm-w form").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#fm-r").textContent = "¡Datos válidos! En un sitio real se enviarían a /enviar.";
});

// 9. Calculadora de contraste WCAG
function lum(h) {
  return [1, 3, 5]
    .map((i) => parseInt(h.substr(i, 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
}

function cc() {
  const f = $("#cf").value;
  const b = $("#cb").value;
  const l1 = lum(f);
  const l2 = lum(b);
  const r = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  $("#cs").style.color = f;
  $("#cs").style.background = b;
  $("#cr").textContent =
    "Contraste " +
    r.toFixed(2).replace(".", ",") +
    ":1 · " +
    (r >= 7 ? "Cumple AAA" : r >= 4.5 ? "Cumple AA" : "No cumple AA: sube el contraste");
}

$("#cf").addEventListener("input", cc);
$("#cb").addEventListener("input", cc);
cc();

// 10. Constructor de portafolio final
const PJ = [
  ["Cabecera y menú", `<header>\n  <h1>Tu nombre</h1>\n  <nav>\n    <a href="#sobre">Sobre mí</a>\n    <a href="#hab">Habilidades</a>\n  </nav>\n</header>`, 0],
  ["Sobre mí", `<section id="sobre">\n  <h2>Sobre mí</h2>\n  <p>Cuéntale al mundo quién eres.</p>\n</section>`, 1],
  ["Habilidades", `<section id="hab">\n  <h2>Habilidades</h2>\n  <ul>\n    <li>HTML</li>\n    <li>CSS</li>\n  </ul>\n</section>`, 1],
  ["Proyectos", `<section id="proy">\n  <h2>Proyectos</h2>\n  <article>\n    <h3>Mi primera web</h3>\n    <p>Una página hecha con HTML.</p>\n  </article>\n</section>`, 1],
  ["Contacto", `<section id="contacto">\n  <h2>Contacto</h2>\n  <form action="/enviar" method="POST">\n    <label for="c1">Correo</label>\n    <input type="email" id="c1" name="correo" required>\n    <button type="submit">Enviar</button>\n  </form>\n</section>`, 1],
  ["Pie de página", `<footer>\n  <p>&copy; 2026 Tu nombre</p>\n</footer>`, 2]
];

const on = new Set([0, 1, 5]);

function pj() {
  $$("#pj-ch .chip").forEach((c, i) => c.classList.toggle("on", on.has(i)));
  const ind = (s) => s.split("\n").map((l) => "    " + l).join("\n");
  const mid = PJ.filter((p, i) => on.has(i) && p[2] === 1).map((p) => p[1]);
  const parts = [];
  PJ.forEach((p, i) => { if (on.has(i) && p[2] === 0) parts.push(p[1]); });
  if (mid.length) parts.push("<main>\n" + mid.map(ind).join("\n") + "\n</main>");
  PJ.forEach((p, i) => { if (on.has(i) && p[2] === 2) parts.push(p[1]); });

  const full =
    '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Tu nombre | Portafolio</title>\n</head>\n<body>\n' +
    parts.join("\n") +
    "\n</body>\n</html>";
  $("#pj-c").textContent = full;
  $("#pj-o").innerHTML = clean(parts.join("\n").replace(/<\/?form[^>]*>/g, ""));
  window.PJF = full;
}

PJ.forEach((p, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.textContent = p[0];
  b.addEventListener("click", () => {
    on.has(i) ? on.delete(i) : on.add(i);
    pj();
  });
  $("#pj-ch").append(b);
});
pj();

$("#pj-cp").addEventListener("click", async (e) => {
  try {
    await navigator.clipboard.writeText(window.PJF);
    const prev = e.target.textContent;
    e.target.textContent = "¡Copiado!";
    setTimeout(() => (e.target.textContent = prev), 2000);
  } catch {
    e.target.textContent = "Selecciona el código y copia con Ctrl/Cmd+C";
  }
});

// 11. Notas resumen ("Recuerda") y enlaces de regreso
const RC = {
  t1: "HTML estructura, CSS da estilo y JavaScript da comportamiento.",
  t2: "HTML nació en 1989–1991 y hoy es un estándar vivo que se actualiza sin versiones nuevas.",
  t3: "El navegador pide, recibe HTML, construye el DOM y dibuja la página.",
  t4: "Un elemento es apertura + contenido + cierre; los atributos van en la apertura.",
  t5: "Todo documento lleva doctype, html con lang, head con charset y title, y body.",
  t6: "Elige la etiqueta por su significado: p para párrafos, a para enlaces, ul para listas.",
  t7: "Las etiquetas semánticas ayudan a lectores de pantalla y buscadores.",
  t8: "Cada campo necesita label y name; required valida sin JavaScript.",
  t9a: "alt descriptivo, contraste mínimo 4,5:1 y todo usable con teclado.",
  t8b: "Indenta, usa comillas rectas, no repitas id y valida tu código.",
  t9: "Si fallaste alguna pregunta, vuelve al capítulo correspondiente y pruébalo en el editor.",
  t12: "Un portafolio completo es solo estas piezas combinadas: header, main, section, footer.",
  t10: "Practica un poco todos los días: HTML, luego CSS, JavaScript y Git."
};

$$(".sheet[id]").forEach((s) => {
  if (s.id === "toc") return;
  const r = RC[s.id];
  if (r) {
    const d = document.createElement("div");
    d.className = "note mt-18";
    d.innerHTML = "<b>Recuerda:</b> ";
    d.append(r);
    s.append(d);
  }
  const a = document.createElement("a");
  a.className = "btn back-toc";
  a.href = "#toc";
  a.textContent = "↑ Volver al contenido";
  s.append(a);
});

// 12. Progreso de lectura y tema oscuro/claro
const LK = $$(".toc a");
function markProgress() {
  let n = 0;
  LK.forEach((a) => {
    const d = document.querySelector(a.hash).getBoundingClientRect().bottom < innerHeight * 0.95;
    a.classList.toggle("done", d);
    if (d) n++;
  });
  $("#toc-n").textContent = n + " de " + LK.length + " capítulos recorridos";
  $("#nav-prog").textContent = n + " / " + LK.length;

  const h = document.documentElement;
  const maxScroll = h.scrollHeight - innerHeight;
  $("#pg").style.width = maxScroll > 0 ? (scrollY / maxScroll) * 100 + "%" : "0%";
}
addEventListener("scroll", markProgress, { passive: true });
markProgress();

const thBtn = $("#th");
function syncThemeLabel() {
  const isDark =
    document.documentElement.dataset.theme === "dark" ||
    (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme:dark)").matches);
  thBtn.textContent = isDark ? "☀️ Claro" : "🌙 Oscuro";
}

const savedTheme = localStorage.getItem("html_guide_theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
syncThemeLabel();

thBtn.addEventListener("click", () => {
  const r = document.documentElement;
  const isDark = r.dataset.theme
    ? r.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme:dark)").matches;
  const next = isDark ? "light" : "dark";
  r.dataset.theme = next;
  localStorage.setItem("html_guide_theme", next);
  syncThemeLabel();
});