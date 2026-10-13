# Plan 001 — Mapa de calor de días estudiados

## Resumen
El mapa de calor se construye con una **lógica pura** (rango de fechas, minutos por día y
nivel de intensidad) separada de la **interfaz** (que solo pinta). La lógica se comparte
entre navegador y Node sin módulos ES y sin build: un archivo de lógica que expone sus
funciones como globales en el navegador y como export CommonJS para los tests. Cubre los
RF-1 a RF-10 y los RNF-1 a RNF-9 de `specs/001-heat-map/spec.md`.

El **código nuevo usa identificadores en inglés** (principio 6 de la constitución);
la interfaz y la documentación siguen en español.

## 1. Archivos: crear o modificar
- **CREAR `logic.js`** — Funciones puras de fechas y de cálculo del mapa. No toca DOM ni
  localStorage. Se carga como script normal en el navegador y como módulo CommonJS en Node
  (export condicional). *Cubre: RF-2, RF-3, RF-5, RF-6, RF-10, RNF-2, RNF-3, RNF-9.*
- **MODIFICAR `app.js`** — Sigue siendo la capa de pintado y de persistencia: conserva el
  formulario, los indicadores actuales y localStorage; sustituye sus funciones de fecha
  duplicadas por las de `logic.js`. Añade `renderHeatmap(sessions)` y la gestión del
  detalle. *Cubre: RF-1, RF-4, RF-6, RF-7, RF-8, RF-9.*
- **MODIFICAR `index.html`** — Añade la sección del mapa (contenedor con scroll, rejilla,
  leyenda y mensaje de estado vacío) y carga `logic.js` antes de `app.js`. *Cubre: RF-1,
  RF-6, RF-7, RF-8.*
- **MODIFICAR `styles.css`** — Estilos de la rejilla, celdas por nivel (0–4), celdas
  "sin datos", leyenda, etiquetas y detalle flotante; responsive y scroll interno. *Cubre:
  RF-3, RF-5, RF-6, RF-8, RNF-5.*
- **CREAR `logic.test.js`** — Tests de la lógica pura con `node --test`. *Cubre: RNF-9.*

> La creación de `logic.js` y `logic.test.js` queda aprobada en este plan (ver §8).

## 2. Funciones puras de lógica (con "hoy" como parámetro)
Todas reciben los datos y "hoy" (texto "AAAA-MM-DD") como argumentos; ninguna accede a DOM,
localStorage ni a la fecha del sistema. Las que no dependen de hoy no lo reciben.

- `localDate(date)` → texto "AAAA-MM-DD" en hora local. *(helper; RNF-3)*
- `addDays(dateText, amount)` → fecha sumando días con `setDate`. *(helper; RNF-3)*
- `isValidDate(text)` → booleano; formato "AAAA-MM-DD" y fecha real (rechaza "2026-13-40").
  *(RF-10)*
- `isFutureDate(dateText, today)` → booleano; comparación de texto (misma longitud). *(RF-5)*
- `mondayOfWeek(dateText)` → fecha del lunes de esa semana. *(RF-1, RF-2)*
- `sundayOfWeek(dateText)` → fecha del domingo de esa semana. *(RF-1, RF-2)*
- `sumMinutesByDay(sessions, today)` → mapa `fecha → minutos`, sumando el mismo día e
  ignorando entradas sin fecha válida, futuras o con minutos no positivos/inválidos.
  *(RF-3, RF-5, RF-10)*
- `groupTopicsByDay(sessions, today)` → mapa `fecha → [temas]` para el detalle. *(RF-4,
  RF-10)*
- `intensityLevel(minutes)` → entero 0–4 según umbrales fijos (1–29→1, 30–59→2, 60–119→3,
  120+→4; no positivo→0). *(RF-3)*
- `mapRange(sessions, today)` → `{ start, end }` o `null` si no hay ninguna sesión válida y
  no futura. `start` = lunes de la semana de la sesión válida no futura más antigua (por
  fecha, no por orden de creación); `end` = domingo de la semana de hoy. *(RF-1, RF-2, RF-5,
  RF-7)*
- `buildHeatmap(sessions, today)` → `{ empty, columns, monthLabels }`, donde cada columna es
  una semana (lunes–domingo) y cada día incluye `{ date, future, level, minutes, topics }`.
  *(RF-1, RF-2, RF-3, RF-5, RF-6, RF-7)*
- `monthLabels(columns)` → lista de `{ columnIndex, text }`; la primera etiqueta y las de
  enero incluyen el año. *(RF-6)*

**Claves de datos**: se mantienen las reales (`fecha`, `tema`, `minutos`, `creadaEn`) para
no perder sesiones (principio 5), aunque el código de lógica use nombres en inglés.

## 3. Algoritmo del mapa (pseudocódigo)
*Cubre: RF-1, RF-2, RF-3, RF-5, RF-6, RF-7.*

```
FUNCIÓN buildHeatmap(sessions, today):
  minutesPerDay = sumMinutesByDay(sessions, today)   // excluye futuras e inválidas
  topicsPerDay  = groupTopicsByDay(sessions, today)
  range = mapRange(sessions, today)
  SI range es null:
      DEVOLVER { empty: verdadero, columns: [], monthLabels: [] }

  start = mondayOfWeek(range.start)
  end   = sundayOfWeek(today)        // semana actual completa (días futuros incluidos)

  columns = []
  week = columna nueva
  PARA cada día d desde start hasta end (paso 1 día):
      future  = isFutureDate(d, today)
      minutes = minutesPerDay[d] o 0
      SI future:
          level = "noData"
      SINO SI minutes > 0:
          level = intensityLevel(minutes)
      SINO:
          level = 0
      celda = { date: d, future, level, minutes, topics: topicsPerDay[d] o [] }
      añadir celda a week
      SI d es domingo Y d NO es end:
          añadir week a columns
          week = columna nueva
  añadir week a columns            // la última se añade siempre

  monthLabels = monthLabels(columns)
  DEVOLVER { empty: falso, columns, monthLabels }
```

Notas:
- Cada columna tiene 7 celdas (lunes–domingo); las semanas completas se cierran al llegar a
  domingo. *(RF-1, RF-2)*
- La última columna es la semana de hoy, con los días futuros marcados como "sin datos".
  *(RF-5)*
- `mapRange` devuelve `null` también cuando solo hay sesiones futuras o todas son inválidas
  → estado vacío. *(RF-7, RF-10)*

## 4. Pintado en la interfaz
*Cubre: RF-1, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RNF-5, RNF-8.*

- **Estructura (`index.html`)**: una tarjeta nueva con título ("Tu constancia"), un
  contenedor con desplazamiento horizontal, una tira de etiquetas de mes, un bloque de
  referencias de días, la rejilla de celdas, la leyenda y un párrafo de estado vacío.
  *Cubre: RF-6, RF-7, RF-8.*
- **Rejilla (`styles.css`)**: rejilla CSS de 7 filas (días) con flujo por columnas
  (semanas), celda de tamaño fijo y una clase por nivel (0–4) más una clase "sin datos".
  *Cubre: RF-1, RF-3, RF-5.*
- **`renderHeatmap(sessions)` en `app.js`**: llama a `buildHeatmap`; si `empty` es
  verdadero, muestra el mensaje y oculta rejilla y leyenda; si no, vacía y reconstruye la
  rejilla, pinta etiquetas y leyenda, y sitúa el scroll en el extremo derecho (hoy).
  *Cubre: RF-1, RF-6, RF-7, RF-8.*
- **Detalle flotante**: un único elemento reutilizado. Cada celda no futura registra
  eventos de ratón, tacto y foco de teclado; al activarse se rellena con fecha (con año),
  total de minutos y temas, y se posiciona dentro de la ventana. Se oculta al salir el
  puntero, al perder el foco, con Escape o al interactuar con otra celda. Las celdas no
  futuras son enfocables y llevan etiqueta accesible. *Cubre: RF-4, RNF-8.*
- **Integración**: la función `pintarTodo()` ya existente añade `renderHeatmap(sessions)`,
  de modo que registrar una sesión actualiza el mapa sin recargar. Al redibujar se conserva
  la posición de scroll. *Cubre: RF-9, RF-8.*

## 5. Decisiones técnicas (con alternativa descartada)
1. **Compartir la lógica con navegador y Node mediante `logic.js` con export condicional.**
   El archivo declara funciones globales (para el `<script>` normal) y añade `module.exports`
   solo si existe `module`. Justificación: permite `node --test` sin módulos ES ni build y
   sigue funcionando con `file://`. *Cubre: RNF-1, RNF-2, RNF-9.*
   - *Descartado*: `require` de `app.js` en los tests (falla porque toca el DOM al cargarse);
     módulos ES (prohibidos por la constitución); duplicar la lógica (se desincroniza);
     bundler (prohibido).
2. **Centralizar las fechas en `logic.js` (`localDate`/`addDays`).** `app.js` elimina sus
   copias y pasa a usar estas. Justificación: una sola fuente de fechas locales evita
   divergencias, el mayor foco de bugs del proyecto. *Cubre: RNF-3, RNF-4.*
   - *Descartado*: mantener dos juegos de helpers de fecha (riesgo de comportamientos
     distintos).
3. **Rejilla CSS con flujo por columnas y una clase por nivel.** *Cubre: RF-1, RF-3.*
   - *Descartado*: posicionamiento absoluto por coordenadas (frágil); `<table>` (menos
     flexible para scroll y etiquetas).
4. **Detalle flotante controlado por JS, no tooltip CSS `:hover`.** Justificación:
   necesita funcionar con tacto y teclado y recortarse al borde de la pantalla. *Cubre:
   RF-4, RNF-8.*
   - *Descartado*: `title`/`:hover` (sin control de posición, sin tacto, sin teclado).
5. **Redibujar toda la rejilla en cada actualización.** Justificación: el número de celdas
   es moderado (unos miles para varios años) y simplifica el código. *Cubre: RNF-6, RF-9.*
   - *Descartado*: render virtual por scroll (complejidad innecesaria para RNF-6).
6. **Scroll inicial al extremo derecho (hoy) y conservado al registrar.** *Cubre: RF-8.*
   - *Descartado*: `scrollIntoView` de hoy (menos predecible con etiquetas); centrar (oculta
     la fecha reciente).
7. **Umbrales de nivel en una constante única, usada por lógica, leyenda y tests.** *Cubre:
   RF-3, RF-6.*
   - *Descartado*: repetir los números en varios sitios (riesgo de incoherencia).
8. **Fechas locales con `setDate` y comparación de texto.** *Cubre: RNF-3.*
   - *Descartado*: `toISOString()`, `new Date("AAAA-MM-DD")` y aritmética de milisegundos
     (desplazan el día; lo recuerda la skill `local-dates`).

## 6. Estrategia de tests con `node --test`
*Cubre: RNF-2, RNF-3, RNF-9; valida RF-2, RF-3, RF-5, RF-6, RF-7, RF-10.*

- **Ejecución**: `node --test` (sin instalar nada). El test usa `require("node:test")`,
  `require("node:assert")` y `require("./logic.js")`. Que el archivo se cargue en Node ya
  demuestra que la lógica no depende del DOM ni de localStorage. *Cubre: RNF-2.*
- **Determinismo**: cada test inyecta un "hoy" fijo, así no dependen del día de ejecución.
  *Cubre: RNF-2.*
- **Casos, mapeados a requisitos**:
  - `intensityLevel`: 0, 1, 29, 30, 59, 60, 119, 120, 1000 y valores no positivos o
    inválidos. *RF-3.*
  - `sumMinutesByDay`: suma de varias sesiones el mismo día; exclusión de futuras; minutos
    ausentes/0/negativos/texto. *RF-3, RF-5, RF-10.*
  - `groupTopicsByDay`: varios temas el mismo día. *RF-4, RF-10.*
  - `isValidDate` / `isFutureDate`: formatos válidos, imposibles y futuros. *RF-5, RF-10.*
  - `mondayOfWeek` / `sundayOfWeek`: cada día de la semana (incluidos lunes y domingo) y
    límites de mes/año. *RF-1, RF-2.*
  - `mapRange`: sin sesiones → `null`; solo futuras → `null`; orden por fecha y no por
    inserción; inicio en lunes; fin en el domingo de la semana de hoy. *RF-1, RF-2, RF-5,
    RF-7.*
  - `buildHeatmap`: columnas de 7 días; primera y última columna; futuros como "sin datos";
    una sola semana; primera sesión en domingo; cambio de mes/año a mitad de semana; año con
    53 semanas; 29 de febrero. *RF-1, RF-2, RF-3, RF-5, RF-6.*
  - `monthLabels`: año en la primera etiqueta y en enero. *RF-6.*
  - `localDate` / `addDays`: fecha local, cambio de mes/año y de hora estacional. *RNF-3.*
- **Puerta de calidad**: no se avanza con tests en rojo (principio 4). La implementación se
  da por terminada solo cuando `node --test` pasa en verde.

## 7. Decisiones resueltas (dudas y conflictos)
- **Archivos nuevos**: aprobados `logic.js` y `logic.test.js`; son necesarios para separar
  la lógica pura (principios 3 y 4) y poder probarla.
- **Claves de datos**: se usan las reales (`fecha`, `tema`, `minutos`, `creadaEn`); la
  descripción en inglés de `AGENTS.md` está desactualizada y no se toca el formato guardado
  (principio 5).
- **Idioma del código**: el código nuevo va en inglés (principio 6). El código existente en
  español de `app.js` (racha, minutos, etc.) no se renombra en esta tarea para no reescribir
  lo que funciona; sólo se adaptan las llamadas a los helpers de fecha compartidos.
- **Tests frente a `AGENTS.md`**: rige la constitución (principio 4), que exige tests; debe
  corregirse la nota "no hay tests ni lint" de `AGENTS.md`.

## 8. Trazabilidad RF → plan
- **RF-1**: §1, §2 (`mondayOfWeek`/`sundayOfWeek`, `buildHeatmap`), §3, §4, §5 (dec. 3), §6.
- **RF-2**: §1, §2, §3, §6.
- **RF-3**: §1, §2, §3, §4, §5 (dec. 3 y 7), §6.
- **RF-4**: §2 (`groupTopicsByDay`), §4, §5 (dec. 4), §6.
- **RF-5**: §1, §2, §3, §4, §6.
- **RF-6**: §1, §2 (`monthLabels`), §3, §4, §5 (dec. 7), §6.
- **RF-7**: §1, §2, §3, §4, §6.
- **RF-8**: §1, §4, §5 (dec. 6).
- **RF-9**: §1, §4, §5 (dec. 5).
- **RF-10**: §1, §2, §3, §6.
- **RNF-1**: §5 (dec. 1).
- **RNF-2**: §2, §5 (dec. 1), §6.
- **RNF-3**: §2, §5 (dec. 2 y 8), §6.
- **RNF-4**: §1, §5 (dec. 2), §6.
- **RNF-5**: §1, §4.
- **RNF-6**: §5 (dec. 5).
- **RNF-7**: §4 (textos en español).
- **RNF-8**: §4, §5 (dec. 4).
- **RNF-9**: §1, §5 (dec. 1), §6.
