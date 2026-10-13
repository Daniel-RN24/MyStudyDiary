const CLAVE_ALMACENAMIENTO = "diario-estudio-sesiones";
const CLAVE_OBJETIVO = "diario-estudio-objetivo-semanal";

const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const listaSesiones = document.getElementById("lista-sesiones");
const avisoSinSesiones = document.getElementById("sin-sesiones");
const numeroRacha = document.getElementById("racha-numero");
const ayudaRacha = document.getElementById("racha-ayuda");
const numeroRachaMejor = document.getElementById("racha-mejor-numero");
const ayudaRachaMejor = document.getElementById("racha-mejor-ayuda");
const numeroMinutosSemana = document.getElementById("minutos-semana-numero");
const ayudaMinutosSemana = document.getElementById("minutos-semana-ayuda");
const numeroDiasMes = document.getElementById("dias-mes-numero");
const unidadDiasMes = document.getElementById("dias-mes-unidad");
const ayudaDiasMes = document.getElementById("dias-mes-ayuda");
const objetivoSin = document.getElementById("objetivo-sin");
const objetivoProgreso = document.getElementById("objetivo-progreso");
const objetivoLlevas = document.getElementById("objetivo-llevas");
const objetivoMeta = document.getElementById("objetivo-meta");
const objetivoBarra = document.getElementById("objetivo-barra");
const objetivoRelleno = document.getElementById("objetivo-relleno");
const objetivoEstado = document.getElementById("objetivo-estado");
const objetivoMensaje = document.getElementById("objetivo-mensaje");
const formularioObjetivo = document.getElementById("formulario-objetivo");
const objetivoMinutos = document.getElementById("objetivo-minutos");
const objetivoGuardar = document.getElementById("objetivo-guardar");
const objetivoQuitar = document.getElementById("objetivo-quitar");
const objetivoError = document.getElementById("objetivo-error");
const mapaVacio = document.getElementById("mapa-vacio");
const mapaContenido = document.getElementById("mapa-contenido");
const mapaDeslizante = document.getElementById("mapa-deslizante");
const mapaMeses = document.getElementById("mapa-meses");
const mapaDias = document.getElementById("mapa-dias");
const mapaRejilla = document.getElementById("mapa-rejilla");
const mapaLeyenda = document.getElementById("mapa-leyenda");
const detalle = document.getElementById("detalle");

const NOMBRES_DIAS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const CLASES_ESTADO_OBJETIVO = ["estado-en-curso", "estado-conseguido", "estado-por-encima"];

let mapaPintadoAntes = false;

function cargarSesiones() {
  const datosGuardados = localStorage.getItem(CLAVE_ALMACENAMIENTO);
  if (!datosGuardados) return [];
  try {
    const sesiones = JSON.parse(datosGuardados);
    return Array.isArray(sesiones) ? sesiones : [];
  } catch {
    return [];
  }
}

function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(sesiones));
}

function cargarObjetivo() {
  try {
    const guardado = localStorage.getItem(CLAVE_OBJETIVO);
    return parseWeeklyGoal(guardado);
  } catch {
    return null;
  }
}

function guardarObjetivo(valor) {
  try {
    if (valor === null || valor === undefined) {
      localStorage.removeItem(CLAVE_OBJETIVO);
    } else {
      localStorage.setItem(CLAVE_OBJETIVO, String(valor));
    }
  } catch {
    // Si localStorage no está disponible, se ignora sin romper la app.
  }
}

function calcularRacha(sesiones) {
  const diasConSesion = new Set(sesiones.map((sesion) => sesion.fecha));
  const hoy = localDate(new Date());
  let dia = diasConSesion.has(hoy) ? hoy : addDays(hoy, -1);
  let racha = 0;
  while (diasConSesion.has(dia)) {
    racha = racha + 1;
    dia = addDays(dia, -1);
  }
  return racha;
}

function calcularMejorRacha(sesiones) {
  const hoy = localDate(new Date());
  const diasUnicos = new Set();

  for (const sesion of sesiones) {
    if (!sesion || !sesion.fecha) continue;
    const fecha = sesion.fecha;
    if (fecha > hoy) continue;
    diasUnicos.add(fecha);
  }

  if (diasUnicos.size === 0) {
    return 0;
  }

  const diasOrdenados = Array.from(diasUnicos).sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });

  let mejorRacha = 1;
  let rachaActual = 1;
  for (let i = 1; i < diasOrdenados.length; i++) {
    const anterior = diasOrdenados[i - 1];
    const actual = diasOrdenados[i];
    const siguienteEsperado = addDays(anterior, 1);

    if (actual === siguienteEsperado) {
      rachaActual = rachaActual + 1;
    } else {
      if (rachaActual > mejorRacha) {
        mejorRacha = rachaActual;
      }
      rachaActual = 1;
    }
  }

  if (rachaActual > mejorRacha) {
    mejorRacha = rachaActual;
  }

  return mejorRacha;
}

function formatearFecha(fechaTexto) {
  const [año, mes, dia] = fechaTexto.split("-").map(Number);
  const fecha = new Date(año, mes - 1, dia, 12);
  const opciones = { weekday: "long", day: "numeric", month: "long" };
  const texto = fecha.toLocaleDateString("es", opciones);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function pintarRacha(sesiones) {
  const racha = calcularRacha(sesiones);
  numeroRacha.textContent = racha;

  const hoy = localDate(new Date());
  const heEstudiadoHoy = sesiones.some((sesion) => sesion.fecha === hoy);

  if (heEstudiadoHoy) {
    ayudaRacha.textContent = "¡Hoy ya has estudiado!";
  } else if (racha > 0) {
    ayudaRacha.textContent = "Estudia hoy para mantener tu racha viva.";
  } else {
    ayudaRacha.textContent = "";
  }
}

function pintarRachaMejor(sesiones) {
  const mejorRacha = calcularMejorRacha(sesiones);
  numeroRachaMejor.textContent = mejorRacha;
  ayudaRachaMejor.textContent = "";
}

function crearElementoSesion(sesion) {
  const elemento = document.createElement("li");
  elemento.className = "sesion";

  const parteIzquierda = document.createElement("div");

  const tema = document.createElement("p");
  tema.className = "sesion-tema";
  tema.textContent = sesion.tema;

  const fecha = document.createElement("p");
  fecha.className = "sesion-fecha";
  fecha.textContent = formatearFecha(sesion.fecha);

  parteIzquierda.append(tema, fecha);

  const minutos = document.createElement("span");
  minutos.className = "sesion-minutos";
  minutos.textContent = `${sesion.minutos} min`;

  elemento.append(parteIzquierda, minutos);
  return elemento;
}

function pintarSesiones(sesiones) {
  listaSesiones.innerHTML = "";

  const ordenadas = [...sesiones].sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return b.creadaEn - a.creadaEn;
  });

  for (const sesion of ordenadas) {
    listaSesiones.append(crearElementoSesion(sesion));
  }

  if (ordenadas.length === 0) {
    avisoSinSesiones.classList.remove("oculto");
  } else {
    avisoSinSesiones.classList.add("oculto");
  }
}

function pintarMinutosEstaSemana(sesiones) {
  const total = sumMinutesInWeek(sesiones, localDate(new Date()));
  numeroMinutosSemana.textContent = total;
  ayudaMinutosSemana.textContent = "";
}

function pintarObjetivo(sesiones) {
  const goal = cargarObjetivo();
  const minutes = sumMinutesInWeek(sesiones, localDate(new Date()));
  const progress = weeklyGoalProgress(goal, minutes);

  if (!progress.hasGoal) {
    objetivoSin.classList.remove("oculto");
    objetivoProgreso.classList.add("oculto");
    objetivoQuitar.classList.add("oculto");
    objetivoGuardar.textContent = "Fijar objetivo";
    objetivoMensaje.textContent = "";
    objetivoError.textContent = "";
    objetivoError.classList.add("oculto");
    objetivoMinutos.removeAttribute("aria-invalid");
    objetivoMinutos.value = "";
    return;
  }

  objetivoSin.classList.add("oculto");
  objetivoProgreso.classList.remove("oculto");

  objetivoLlevas.textContent = progress.minutes;
  objetivoMeta.textContent = progress.goalMinutes;

  objetivoRelleno.style.width = progress.percent + "%";
  objetivoBarra.setAttribute("aria-valuenow", String(Math.round(progress.percent)));
  objetivoBarra.setAttribute("aria-valuetext", `${progress.minutes} de ${progress.goalMinutes} min`);

  objetivoEstado.textContent = progress.statusText;
  objetivoEstado.classList.remove(...CLASES_ESTADO_OBJETIVO);
  objetivoEstado.classList.add("estado-" + progress.status);

  objetivoQuitar.classList.remove("oculto");
  objetivoGuardar.textContent = "Cambiar objetivo";
  objetivoMinutos.value = progress.goalMinutes;

  objetivoError.textContent = "";
  objetivoError.classList.add("oculto");
  objetivoMinutos.removeAttribute("aria-invalid");

  if (progress.status === "en-curso") {
    objetivoMensaje.textContent = `Te faltan ${progress.remaining} min para alcanzar tu objetivo.`;
  } else if (progress.status === "conseguido") {
    objetivoMensaje.textContent = "¡Objetivo conseguido! Has alcanzado justo tu objetivo semanal.";
  } else if (progress.status === "por-encima") {
    objetivoMensaje.textContent = `¡Objetivo conseguido! Vas ${progress.minutes - progress.goalMinutes} min por encima de tu objetivo.`;
  }
}

function calcularDiasEsteMes(sesiones) {
  const hoy = localDate(new Date());
  const mesActual = hoy.slice(0, 7);
  const diasUnicos = new Set();

  for (const sesion of sesiones) {
    if (!sesion || !sesion.fecha) continue;
    const fecha = sesion.fecha;
    if (fecha > hoy) continue;
    if (fecha.slice(0, 7) !== mesActual) continue;
    diasUnicos.add(fecha);
  }

  return diasUnicos.size;
}

function pintarDiasEsteMes(sesiones) {
  const dias = calcularDiasEsteMes(sesiones);
  numeroDiasMes.textContent = dias;
  unidadDiasMes.textContent = dias === 1 ? "día" : "días";

  const hoy = localDate(new Date());
  const [año, mes, dia] = hoy.split("-").map(Number);
  const nombreMes = new Date(año, mes - 1, 1, 12).toLocaleDateString("es", {
    month: "long"
  });
  ayudaDiasMes.textContent = `Llevas ${dias} de ${dia} días de ${nombreMes}`;
}

function formatearFechaCompleta(fechaTexto) {
  const [año, mes, dia] = fechaTexto.split("-").map(Number);
  const fecha = new Date(año, mes - 1, dia, 12);
  const opciones = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  const texto = fecha.toLocaleDateString("es", opciones);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function pintarEtiquetasMes(etiquetas, totalColumnas) {
  mapaMeses.innerHTML = "";
  for (let i = 0; i < totalColumnas; i++) {
    const elemento = document.createElement("span");
    const etiqueta = etiquetas.find((e) => e.columnIndex === i);
    if (etiqueta) elemento.textContent = etiqueta.text;
    mapaMeses.append(elemento);
  }
}

function pintarDiasSemana() {
  mapaDias.innerHTML = "";
  for (const nombre of NOMBRES_DIAS) {
    const elemento = document.createElement("li");
    elemento.textContent = nombre;
    mapaDias.append(elemento);
  }
}

function descripcionAccesible(celda) {
  const fecha = formatearFechaCompleta(celda.date);
  if (celda.minutes > 0) {
    const temas = celda.topics.length > 0 ? ` Temas: ${celda.topics.join(", ")}.` : ".";
    return `${fecha}. ${celda.minutes} minutos${temas}`;
  }
  return `${fecha}. Sin estudio.`;
}

function crearCelda(celda) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "celda";

  if (celda.future) {
    boton.classList.add("no-dato");
    boton.disabled = true;
    boton.setAttribute("aria-label", "Sin datos");
    return boton;
  }

  boton.classList.add(`nivel-${celda.level}`);
  boton.setAttribute("aria-label", descripcionAccesible(celda));
  boton.addEventListener("mouseenter", () => mostrarDetalle(boton, celda));
  boton.addEventListener("mouseleave", ocultarDetalle);
  boton.addEventListener("focus", () => mostrarDetalle(boton, celda));
  boton.addEventListener("blur", ocultarDetalle);
  return boton;
}

function pintarRejilla(columnas) {
  mapaRejilla.innerHTML = "";
  for (const columna of columnas) {
    for (const celda of columna) {
      mapaRejilla.append(crearCelda(celda));
    }
  }
}

function pintarLeyenda() {
  mapaLeyenda.innerHTML = "";

  const items = [{ clase: "nivel-0", texto: "Sin estudio" }];
  let inicio = 1;
  for (const nivel of LEVELS) {
    const texto = nivel.max === Infinity ? `${inicio}+` : `${inicio}–${nivel.max}`;
    items.push({ clase: `nivel-${nivel.level}`, texto });
    inicio = nivel.max + 1;
  }
  items.push({ clase: "no-dato", texto: "Futuro" });

  const lista = document.createElement("ul");
  lista.className = "leyenda-lista";
  for (const item of items) {
    const elemento = document.createElement("li");
    const muestra = document.createElement("span");
    muestra.className = `celda leyenda-celda ${item.clase}`;
    const texto = document.createElement("span");
    texto.textContent = item.texto;
    elemento.append(muestra, texto);
    lista.append(elemento);
  }
  mapaLeyenda.append(lista);
}

function ocultarDetalle() {
  detalle.classList.add("oculto");
}

function posicionarDetalle(celdaElemento) {
  const rect = celdaElemento.getBoundingClientRect();
  const ancho = detalle.offsetWidth;
  const alto = detalle.offsetHeight;

  let izquierda = rect.left;
  if (izquierda + ancho > window.innerWidth) {
    izquierda = window.innerWidth - ancho - 8;
  }
  if (izquierda < 8) izquierda = 8;

  let superior = rect.bottom + 8;
  if (superior + alto > window.innerHeight) {
    superior = rect.top - alto - 8;
  }
  if (superior < 8) superior = 8;

  detalle.style.left = `${izquierda}px`;
  detalle.style.top = `${superior}px`;
}

function mostrarDetalle(celdaElemento, celda) {
  detalle.innerHTML = "";

  const fecha = document.createElement("p");
  fecha.textContent = formatearFechaCompleta(celda.date);
  detalle.append(fecha);

  const minutos = document.createElement("p");
  minutos.textContent = celda.minutes > 0 ? `${celda.minutes} min` : "Sin estudio";
  detalle.append(minutos);

  if (celda.topics.length > 0) {
    const listaTemas = document.createElement("ul");
    for (const tema of celda.topics) {
      const elemento = document.createElement("li");
      elemento.textContent = tema;
      listaTemas.append(elemento);
    }
    detalle.append(listaTemas);
  }

  detalle.classList.remove("oculto");
  posicionarDetalle(celdaElemento);
}

function renderHeatmap(sesiones) {
  const mapa = buildHeatmap(sesiones, localDate(new Date()));
  const posicionScroll = mapaDeslizante.scrollLeft;

  ocultarDetalle();

  if (mapa.empty) {
    mapaVacio.classList.remove("oculto");
    mapaContenido.classList.add("oculto");
    mapaPintadoAntes = false;
    return;
  }

  mapaVacio.classList.add("oculto");
  mapaContenido.classList.remove("oculto");

  pintarEtiquetasMes(mapa.monthLabels, mapa.columns.length);
  pintarDiasSemana();
  pintarRejilla(mapa.columns);
  pintarLeyenda();

  if (mapaPintadoAntes) {
    mapaDeslizante.scrollLeft = posicionScroll;
  } else {
    mapaDeslizante.scrollLeft = mapaDeslizante.scrollWidth;
    mapaPintadoAntes = true;
  }
}

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") ocultarDetalle();
});

function pintarTodo() {
  const sesiones = cargarSesiones();
  pintarRacha(sesiones);
  pintarRachaMejor(sesiones);
  pintarMinutosEstaSemana(sesiones);
  pintarDiasEsteMes(sesiones);
  pintarObjetivo(sesiones);
  pintarSesiones(sesiones);
  renderHeatmap(sesiones);
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const minutos = Number(campoMinutos.value);
  const esValido =
    campoFecha.value !== "" &&
    campoTema.value.trim() !== "" &&
    Number.isFinite(minutos) &&
    minutos > 0;

  if (!esValido) return;

  const sesiones = cargarSesiones();
  sesiones.push({
    fecha: campoFecha.value,
    tema: campoTema.value.trim(),
    minutos: minutos,
    creadaEn: Date.now()
  });
  guardarSesiones(sesiones);

  formulario.reset();
  campoFecha.value = localDate(new Date());
  pintarTodo();
});

formularioObjetivo.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const valor = Number(objetivoMinutos.value);

  if (!isValidWeeklyGoal(valor)) {
    objetivoError.textContent =
      "El objetivo debe ser un número entero de minutos mayor que cero.";
    objetivoError.classList.remove("oculto");
    objetivoMinutos.setAttribute("aria-invalid", "true");
    return;
  }

  guardarObjetivo(valor);
  objetivoError.textContent = "";
  objetivoError.classList.add("oculto");
  objetivoMinutos.removeAttribute("aria-invalid");
  pintarObjetivo(cargarSesiones());
});

objetivoQuitar.addEventListener("click", () => {
  guardarObjetivo(null);
  objetivoError.textContent = "";
  objetivoError.classList.add("oculto");
  objetivoMinutos.removeAttribute("aria-invalid");
  pintarObjetivo(cargarSesiones());
});

campoFecha.value = localDate(new Date());
pintarTodo();
