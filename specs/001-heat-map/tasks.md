# Tasks 001 — Mapa de calor de días estudiados

Tareas pequeñas (20–30 min), en orden de dependencia. Cada una indica los RF/RNF que cubre
y una condición "Hecho cuando" verificable. Fuente: `spec.md` y `plan.md`.

## Fase A — Lógica pura de fechas (`logic.js`)
- [x] **A1. Crear `logic.js` con helpers de fecha local.** Añade `localDate(date)` y
  `addDays(dateText, amount)` usando `getFullYear/getMonth/getDate` y `setDate`, más el
  export condicional para Node. *Cubre: RNF-3, RNF-2.*
  **Hecho cuando:** `node --test` carga el archivo sin errores de DOM y `localDate`/`addDays`
  devuelven fechas locales correctas para un caso de cambio de mes y otro de año.
- [x] **A2. Añadir y probar validación y detección de futuro.** Implementa
  `isValidDate(text)` e `isFutureDate(dateText, today)` y escríbelas en `logic.test.js`.
  *Cubre: RF-5, RF-10, RNF-9.*
  **Hecho cuando:** los tests aceptan `2026-02-29` como inválido, rechazan `2026-13-40` y
  clasifican correctamente un día pasado, hoy y uno futuro.
- [x] **A3. Añadir y probar límites de semana.** Implementa `mondayOfWeek(dateText)` y
  `sundayOfWeek(dateText)` y sus tests. *Cubre: RF-1, RF-2, RNF-9.*
  **Hecho cuando:** para los 7 días de una semana los tests devuelven el mismo lunes y
  domingo, incluidos los casos de límite de mes y de año.

## Fase B — Lógica pura del mapa (`logic.js`)
- [x] **B1. Implementar y probar `sumMinutesByDay(sessions, today)`.** Suma minutos por
  día, ignora fechas inválidas, futuras y minutos no positivos o en texto. *Cubre: RF-3,
  RF-5, RF-10, RNF-9.*
  **Hecho cuando:** los tests confirman la suma de dos sesiones del mismo día y la exclusión
  de una sesión futura y otra con minutos inválidos.
- [x] **B2. Implementar y probar `groupTopicsByDay(sessions, today)`.** Agrupa los temas por
  día para el detalle. *Cubre: RF-4, RF-10, RNF-9.*
  **Hecho cuando:** un test devuelve los dos temas de un día con dos sesiones y ninguno para
  un día sin sesiones.
- [x] **B3. Implementar y probar `intensityLevel(minutes)`.** Define la constante de
  umbrales (1–29→1, 30–59→2, 60–119→3, 120+→4; no positivo→0). *Cubre: RF-3, RNF-9.*
  **Hecho cuando:** los tests pasan con los valores límite 0, 1, 29, 30, 59, 60, 119, 120 y
  1000.
- [x] **B4. Implementar y probar `mapRange(sessions, today)`.** Devuelve `{ start, end }` o
  `null`; inicio en lunes de la sesión válida no futura más antigua, fin en el domingo de la
  semana de hoy. *Cubre: RF-1, RF-2, RF-5, RF-7, RNF-9.*
  **Hecho cuando:** los tests cubren sin sesiones → `null`, solo futuras → `null`, orden por
  fecha (no por inserción) y alineación a lunes/domingo.
- [x] **B5. Implementar y probar `buildHeatmap(sessions, today)`.** Construye las columnas
  (semanas lunes–domingo) con celdas `{ date, future, level, minutes, topics }` y detecta el
  estado vacío. *Cubre: RF-1, RF-2, RF-3, RF-5, RF-7, RNF-9.*
  **Hecho cuando:** los tests verifican columnas de 7 días, una sola semana, primera sesión
  en domingo, cambio de mes/año a mitad de semana, año con 53 semanas y 29 de febrero.
- [x] **B6. Implementar y probar `monthLabels(columns)`.** Etiquetas de mes con año en la
  primera y en enero. *Cubre: RF-6, RNF-9.*
  **Hecho cuando:** un test comprueba que la primera etiqueta y la de enero incluyen el año
  y que los meses repetidos en años distintos no se confunden.

## Fase C — Integración de la lógica existente (`app.js`)
- [x] **C1. Usar los helpers compartidos de fecha en `app.js`.** Elimina `fechaLocal` y
  `sumarDias` locales y sustituye sus llamadas por `localDate`/`addDays`. *Cubre: RNF-3,
  RNF-4.*
  **Hecho cuando:** registrar una sesión, la racha, la mejor racha, minutos de la semana y
  días del mes siguen mostrando los mismos valores que antes (memoria: racha 3, 135 min,
  3 días).

## Fase D — Interfaz: estructura y estilos
- [x] **D1. Añadir la sección del mapa en `index.html`.** Contenedor con scroll, hueco para
  rejilla, leyenda, estado vacío y carga de `logic.js` antes de `app.js`. *Cubre: RF-1,
  RF-6, RF-7, RF-8.*
  **Hecho cuando:** la página carga sin errores en consola y el script de lógica se ejecuta
  antes que el de la app.
- [x] **D2. Estilar la rejilla y los niveles en `styles.css`.** 7 filas con flujo por
  columnas, celda de tamaño fijo, clases por nivel (0–4) y clase "sin datos". *Cubre: RF-1,
  RF-3, RF-5, RNF-5.*
  **Hecho cuando:** una rejilla de prueba muestra 5 colores distinguibles más el estado "sin
  datos" y no desborda el contenedor.
- [x] **D3. Estilar leyenda, etiquetas y detalle flotante.** Leyenda con rangos, etiquetas de
  mes y días, y estilos del detalle flotante. *Cubre: RF-6, RNF-5.*
  **Hecho cuando:** leyenda y etiquetas son legibles en móvil (375 px) y el detalle flotante
  se sitúa por encima de la rejilla sin romper el diseño.

## Fase E — Interfaz: pintado (`app.js`)
- [x] **E1. Implementar `renderHeatmap(sessions)` con rejilla y etiquetas.** Llama a
  `buildHeatmap` y pinta columnas, celdas, etiquetas de mes y referencias de días. *Cubre:
  RF-1, RF-3, RF-5, RF-6.*
  **Hecho cuando:** con varias sesiones de ejemplo se ven los días coloreados según nivel y
  los días futuros como "sin datos".
- [x] **E2. Implementar el estado vacío.** Si `buildHeatmap` devuelve `empty`, muestra el
  mensaje y oculta rejilla y leyenda. *Cubre: RF-7.*
  **Hecho cuando:** sin sesiones (o solo con sesiones futuras) se ve el mensaje de invitación
  y no la rejilla ni la leyenda.
- [x] **E3. Implementar el scroll horizontal anclado a hoy.** Contenedor con scroll interno;
  al pintar, situar el scroll en el extremo derecho. *Cubre: RF-8, RNF-5.*
  **Hecho cuando:** con un histórico de varios meses el mapa se desplaza horizontalmente sin
  mover la página y arranca mostrando la fecha más reciente.
- [x] **E4. Implementar el detalle flotante (ratón, táctil y teclado).** Rellena fecha con
  año, minutos y temas; se oculta al salir, al perder foco, con Escape o al cambiar de celda;
  permanece dentro de la pantalla. *Cubre: RF-4, RNF-8.*
  **Hecho cuando:** el detalle aparece con ratón, con tacto y con tabulador, y se ve completo
  en la primera y la última columna.
- [x] **E5. Integrar `renderHeatmap` en `pintarTodo` y conservar el scroll.** Actualiza el
  mapa al registrar sin recargar y mantiene la posición de desplazamiento. *Cubre: RF-9,
  RF-8.*
  **Hecho cuando:** tras registrar una sesión el mapa se actualiza al instante y el scroll
  no salta.

## Fase F — Verificación
- [x] **F1. Pasar toda la suite de tests.** Ejecuta `node --test`. *Cubre: RNF-9.*
  **Hecho cuando:** todos los tests de `logic.test.js` están en verde.
- [x] **F2. Verificar en navegador, móvil y accesibilidad.** Abre `index.html` con doble
  clic; prueba 375 px, zoom/fuente aumentada, navegación por teclado y aspecto de los niveles.
  *Cubre: RNF-5, RNF-8, RF-6, RF-7.*
  **Hecho cuando:** no hay desbordamiento horizontal de página, no hay errores en consola y
  los textos están en español.
- [x] **F3. Actualizar `MEMORY.md` y corregir `AGENTS.md`.** Anota el estado y propone mover
  las reglas permanentes a `AGENTS.md` (nota de tests y claves de datos). *Cubre: forma de
  trabajar.*
  **Hecho cuando:** `MEMORY.md` refleja el mapa implementado y `AGENTS.md` no contradice la
  constitución sobre tests ni sobre las claves de datos.
