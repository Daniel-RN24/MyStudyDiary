# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha, minutos esta semana, días estudiados este mes y lista de sesiones.
- v2: mapa de calor de días estudiados (spec `001-heat-map` completa).
- v3: objetivo semanal implementado (spec `002-weekly-goal` completa): fijar/cambiar/quitar, progreso "X / Y min" + barra + "te faltan Z min", estados En curso/Conseguido (al superar el objetivo la etiqueta sigue siendo "Conseguido" y el aviso de ir por encima va en el mensaje).
- `logic.js`: lógica pura (fechas locales, métricas del mapa, objetivo) con export condicional navegador/Node. `logic.test.js`: 47 tests, `node --test` en verde.
- `app.js` usa `sumMinutesInWeek` (fuente única con "Minutos esta semana") y gestiona el objetivo; `index.html`/`styles.css` añaden el bloque responsive junto a la tarjeta.
- Datos en localStorage. Este archivo se llama `MEMORY.md` (en minúsculas, sin extensión `.MD`).
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Racha: `calcularRacha()` (termina hoy, sigue viva desde ayer) y `calcularMejorRacha()` (corrida consecutiva máxima global, excluye futuras), usando días únicos para que varias sesiones no inflen.
- Minutos esta semana: suma de todas las sesiones de lunes–domingo (inicio=lunes, finEfectivo=min(domingo,hoy)), excluye futuras; usa `localDate`, `addDays`, `mondayOfWeek`.
- Días del mes: días únicos comparando el prefijo `AAAA-MM`; excluye futuras. En la tarjeta, singular/plural y "Llevas 3 de 4 días de octubre".
- Mapa: `buildHeatmap` da columnas lunes–domingo con celdas `{date, future, level, minutes, topics}`; `intensityLevel` usa `LEVELS` (0; 1–29; 30–59; 60–119; 120+, límite superior inclusivo); `monthLabels` etiqueta por el día 1 del mes. Días futuros: sin datos, no interactivos.
- Objetivo semanal: valor único y recurrente, en clave propia `diario-estudio-objetivo-semanal` (`String(valor)`; quitar = `removeItem`), sin tocar `diario-estudio-sesiones`.
- Minutos de la semana = fuente única `sumMinutesInWeek(sessions, today)`, compartida por la tarjeta y el objetivo para que nunca difieran.
- `weeklyGoalProgress(goal, minutes)` devuelve `hasGoal`, `percent` (topeado a 100), `remaining`, `status` (`sin-objetivo`/`en-curso`/`conseguido`/`por-encima`) y `statusText` en español; la barra se topa al 100% y "por encima" se comunica aparte.
- Formulario del objetivo con `novalidate` para mostrar el error en español. Minutos válidos: finitos y > 0 (decimales positivos se suman).
## Aprendizajes y errores a evitar
- No obtener la mejor racha contando hacia atrás desde hoy: hay que escanear todas las corridas.
- Fechas: usar `localDate`/`addDays`, nunca UTC ni `new Date("AAAA-MM-DD")`. Para "días del mes" usar el texto (`fecha.slice(8, 10)`), no aritmética de meses.
- `monthLabels`: la etiqueta sale del día 1 del mes, no del lunes de la columna.
- Traer la lógica pura a `logic.js` (identificadores en inglés, export condicional) mantiene `app.js` legible y permite tests con `node --test`.
- Varios subagentes afirmaron haber guardado archivos que no estaban: verificar con grep antes de darlo por hecho.
- La validación nativa del navegador intercepta `input type=number` con `step`; por eso el formulario del objetivo usa `novalidate`.
- `AGENTS.md` ya corregido: claves reales (`fecha/tema/minutos/creadaEn`), helpers `localDate`/`addDays` y tests (`node --test`).
