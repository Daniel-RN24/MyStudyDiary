# Plan: Objetivo semanal de estudio

## Objetivo
Añadir un objetivo semanal de estudio que permita fijar cuántos minutos se quiere estudiar cada semana y ver cuánto se lleva, para motivarse a cumplirlo. Se compartirá una única fuente pura para el cálculo de "minutos de la semana" entre la tarjeta "Minutos esta semana" (existente) y el nuevo bloque del objetivo. No se modifica el formato de los datos de sesiones.

## Alcance
- Bloque de objetivo semanal visible junto a la tarjeta existente (no la sustituye).
- Fijar/cambiar y quitar el objetivo.
- Mostrar "X / Y min", barra de progreso (tope visual 100%), "te faltan Z min" y etiqueta textual de estado, con felicitación/aviso según corresponda.
- Persistencia en clave propia `diario-estudio-objetivo-semanal`; sin tocar `diario-estudio-sesiones`.
- Actualización al registrar sesión sin recargar.
- Accesibilidad, español, responsive/móvil. Lógica pura para cálculos; sin dependencias, frameworks, build, módulos ES.

## Documentos de referencia
- `specs/002-weekly-goal/spec.md` (fuente de verdad)
- `specs/001-heat-map/plan.md` y `specs/001-heat-map/tasks.md` (estilo/formato)
- `docs/constitution.md`, `AGENTS.md`, `MEMORY.md`
- Código actual: `logic.js`, `logic.test.js`, `app.js`, `index.html`, `styles.css`

## Archivos a modificar/crear
- `logic.js`: extraer/refactor `sumMinutesInWeek(sessions, today)` (pura). Añadir helpers puros `isValidWeeklyGoal(v)`, `parseWeeklyGoal(raw)`, `weeklyGoalProgress(goal, minutesInWeek)`. Se sigue exportando lo existente por CommonJS para tests (`module.exports`).
- `app.js`: usar la función pura compartida en lugar de `calcularMinutosEstaSemana` (no pura). Añadir gestión UI/estado del objetivo (leer/escribir en localStorage, validar, renderizar bloque, actualizar al registrar).
- `index.html`: añadir el bloque del objetivo semanal junto a la tarjeta "Minutos esta semana".
- `styles.css`: estilos para el bloque, barra de progreso accesible, estados; mantener coherencia con estilos existentes; responsive/móvil.
- `logic.test.js`: añadir tests puros para `sumMinutesInWeek` y para validación/progreso/estados del objetivo.

## Refactor: fuente única de "minutos de la semana"
Hoy `app.js` tiene `calcularMinutosEstaSemana` (no pura: usa `new Date()` y `Number(sesion.minutos || 0)`). Se extrae a `logic.js` como función pura:

- Firma propuesta: `sumMinutesInWeek(sessions, today)` donde `today` es un objeto `Date` (fecha local del usuario), `sessions` es el array de sesiones.
- Reutiliza `mondayOfWeek` y `addDays` existentes en `logic.js`.
- Criterios de suma:
  - Suma **todas** las sesiones con fecha dentro de la semana que contiene `today`, considerando inicio lunes y fin domingo (límites incluidos). 
  - Excluye fechas futuras (`fecha > hoy`).
  - Solo suma minutos válidos: ignora valores no numéricos, no finitos, 0 o negativos (<= 0 se ignora).
  - **Decimales positivos se suman con su valor** (RF-2).
- La tarjeta "Minutos esta semana" existente pasará a usar `sumMinutesInWeek(sessions, today)` (inyectando "hoy" desde `app.js`). Con datos válidos, el resultado debe ser idéntico.
- No se accede a DOM ni `localStorage` desde `logic.js`.

## Funciones puras nuevas (propuestas)
- `isValidWeeklyGoal(v)`: retorna `true` si `v` es un entero positivo (valor > 0, entero). Se valida explícitamente (mensaje visible/accesible en UI). 
- `parseWeeklyGoal(raw)`: parsea lo leído de localStorage (string/number); devuelve objetivo válido o `null` si ausente/corrupto. Usado para lectura tolerante.
- `weeklyGoalProgress(goal, minutesInWeek)`: calcula progreso para visualización/estado. Entradas puras.
  - `goal`: número entero positivo o `null`/`undefined` (sin objetivo).
  - `minutesInWeek`: número >= 0 (resultado de `sumMinutesInWeek`).
  - Devuelve objeto con: `hasGoal` (bool), `goalMinutes` (number|null), `minutes` (number), `percent` (number 0–100, **topeado al 100%** para la barra de progreso), `remaining` (number >= 0, minutos que faltan para alcanzar el objetivo: `max(0, goal - minutes)`), `status` (`"sin-objetivo" | "en-curso" | "conseguido" | "por-encima"`), `statusText` (texto en español), `showCongrats` (bool), `showAbove` (bool).
  - Estados y textos (según RF-3/RF-4):
    - `sin-objetivo`: sin objetivo fijado.
    - `en-curso`: hay objetivo y `minutes < goal`.
    - `conseguido`: hay objetivo y `minutes >= goal` pero aún no superado de forma que se considere "por encima"? RF-4: "En curso"/"Conseguido", felicitación, aviso de "por encima". Interpretación coherente con spec: `conseguido` cuando se alcanza exactamente o llega al objetivo (>= goal) y no hay exceso significativo que deba mostrarse como "por encima"? Se propone: `status = "conseguido"` si `hasGoal && minutes >= goal && minutes < goal * 1?` pero más claramente: si `minutes >= goal` → logrado; si `minutes > goal` → mostrar aviso "por encima" además de estado logrado. Propuesta: `status = "por-encima"` si `hasGoal && minutes > goal`, `status = "conseguido"` si `hasGoal && minutes == goal`, `status = "en-curso"` si `hasGoal && minutes < goal`. (Si hay decimales, usar comparación numérica normal.)
    - Textos en español: p.e. "Sin objetivo", "En curso", "Conseguido", "Por encima del objetivo".

## Persistencia
- Clave: `diario-estudio-objetivo-semanal`. Valor esperado: número/string representando objetivo (entero positivo) o `null` para "sin objetivo".
- Lectura tolerante: intentar parsear; si ausente, no numérico, no finito, <= 0 o no entero → tratar como sin objetivo (RF-7). No lanzar errores.
- Escritura: solo al fijar/cambiar/quitar. No tocar `diario-estudio-sesiones`. 
- try/catch alrededor de accesos a `localStorage` (robusto ante entornos restrictivos aunque `file://` suele permitirlo; tolerante).

## Interfaz (HTML/CSS)
- Colocar el nuevo bloque **junto a la tarjeta "Minutos esta semana"** (no sustituirla). En `index.html`, mantener la estructura existente; añadir sección con id `weekly-goal` accesible.
- Elementos: formulario para fijar/cambiar objetivo (input numérico, etiqueta asociada), botón "Fijar objetivo"/"Cambiar objetivo" según estado, botón "Quitar objetivo" cuando hay objetivo. 
- Visualización: texto "X / Y min" (X = minutos de la semana calculados con función pura; Y = objetivo). Barra de progreso `<progress>` o elemento con `role="progressbar"` con `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` válido (topeado a 100). 
- Mensajes: "te faltan Z min" cuando `en-curso` (Z = `goal - minutes` redondeado de forma legible, mostrar entero si no hay decimales relevantes o mantener coherente con datos). Felicitación cuando `conseguido` (mensaje visible). Aviso cuando `por-encima`. 
- Accesibilidad: etiquetas, textos claros, foco visible, contraste legible. 
- Responsive/móvil: el bloque debe apilarse/coexistir con la tarjeta sin romper el layout actual.

## Comportamiento
- RF-5: actualizar al registrar sesión sin recargar. Al guardar nueva sesión (acción existente), recalcular y repintar ambos bloques usando la misma función pura con "hoy".
- RF-8: cambiar y quitar objetivo. Al quitar, borrar de localStorage (o guardar `null`) y volver a estado "sin objetivo".
- RF-7: sin objetivo → bloque muestra estado correspondiente; datos inválidos/corruptos en objetivo → tratado como sin objetivo sin romper la app.
- Fechas locales siempre: no usar `toISOString()`, no usar `new Date("AAAA-MM-DD")` para construir desde string de fecha.

## Decisiones justificadas (con alternativa descartada)
1. **Fuente única (pura) para "minutos de la semana".**
- Decisión: extraer `sumMinutesInWeek(sessions, today)` a `logic.js` (pura), reutilizar `mondayOfWeek`/`addDays`, aplicar filtros de minutos válidos según spec. 
- Alternativa descartada: duplicar lógica en `app.js` para el objetivo (menos DRY, riesgo de divergencia con la tarjeta existente).
- RF cubierto: RF-2, RF-5.

2. **Suma de todas las sesiones (no días únicos).**
- Decisión: mantener coherencia con la tarjeta "Minutos esta semana" actual (suma total de minutos de todas las sesiones de la semana). 
- Alternativa descartada: contar minutos por día único (cambiaría semántica de la métrica existente; spec indica "suma total de minutos de todas las sesiones").
- RF cubierto: RF-2.

3. **Tope visual del porcentaje a 100%.**
- Decisión: `percent = Math.min(100, (minutes/goal)*100)` para la barra (visual), pero mantener estado `por-encima` cuando `minutes > goal` (mostrar aviso). Así barra no se desborda visualmente y se comunica exceso.
- Alternativa descartada: permitir >100% en barra (puede romper layout/accesibilidad visual).
- RF cubierto: RF-3, RF-4.

4. **Persistencia en clave propia, tolerante.**
- Decisión: `diario-estudio-objetivo-semanal` independiente; lectura tolerante trata corrupto/ausente como sin objetivo.
- Alternativa descartada: guardar dentro de `diario-estudio-sesiones` (rompe separación, riesgo de afectar formato existente).
- RF cubierto: RF-6, RF-7.

5. **Comparación numérica para decimales.**
- Decisión: usar comparación normal para `==`/`>` con valores numéricos (decimales positivos sumados con su valor). 
- Alternativa descartada: forzar entero (spec pide "entero positivo" para el objetivo, no para los minutos sumados).
- RF cubierto: RF-2, RF-4.

## Estrategia de tests con `node --test`
Los tests se ejecutan sobre `logic.js` con CommonJS. Añadir casos puros:

### Para `sumMinutesInWeek(sessions, today)`
- Semana lunes–domingo que contiene hoy: sesiones lunes/domingo → incluidas. Sesiones fuera de semana → excluidas.
- Fechas futuras (`> hoy`) → excluidas aunque pertenezcan a la semana teórica? Criterio: "excluye fechas futuras (`> hoy`)". Así se aplica globalmente.
- Mismo día varias sesiones → todas sumadas (coherente con tarjeta).
- Minutos: `10`, `30.5` (decimal positivo suma su valor), `0`, `-5`, `NaN`, `Infinity`, `undefined`, `null` → ignorados.
- Sesiones sin `fecha` o fecha inválida → no contribuyen.
- Resultado idéntico con datos válidos entre tarjeta nueva/refactorizada.

### Para `isValidWeeklyGoal` / `parseWeeklyGoal`
- Válidos: `10`, `60`, `1` (enteros positivos).
- Inválidos: `0`, `-1`, `1.5` (no entero), `NaN`, `Infinity`, `null`, `undefined`, `""`, `"abc"`, objeto → `null`/inválido.

### Para `weeklyGoalProgress(goal, minutesInWeek)`
- Sin objetivo (`null`) → `hasGoal=false`, `status="sin-objetivo"`, textos en español.
- `en-curso`: goal=60, minutes=30 → percent=50, remaining=30, status="en-curso".
- `conseguido`: goal=60, minutes=60 → percent=100, remaining=0, status="conseguido", `showCongrats=true`.
- `por-encima`: goal=60, minutes=75 → percent=100 (topeado), remaining=0, status="por-encima", `showAbove=true`.
- Decimales: goal=60, minutes=60.5 → por encima, percent 100, remaining 0.
- minutes=0, goal=60 → en-curso, 0%.

## Qué RF cubre cada parte
- RF-1 (fijar objetivo, entero positivo, validación con mensaje visible/accesible, aplica a semana en curso desde lunes, valor único y recurrente): lógica UI + validación pura + HTML.
- RF-2 (cálculo minutos semana con función pura única, comparte con tarjeta; criterios): `sumMinutesInWeek` + refactor app.js.
- RF-3 (mostrar X/Y min, barra progreso tope 100%, "te faltan Z min", etiqueta textual): `weeklyGoalProgress` + HTML/CSS.
- RF-4 (estado consecución: En curso/Conseguido, felicitación, aviso "por encima"): `weeklyGoalProgress` + UI.
- RF-5 (actualizar al registrar sin recargar): app.js (recalcular tras guardar sesión).
- RF-6 (persistir en clave propia): localStorage en app.js.
- RF-7 (estado sin objetivo, robustez ante datos inválidos/corruptos): parseo tolerante + UI.
- RF-8 (cambiar y quitar objetivo): UI + persistencia.

## Plan de ejecución (orden lógico)
1. `logic.js`: añadir `sumMinutesInWeek` (extraer lógica pura), añadir helpers de objetivo. 
2. `logic.test.js`: añadir tests puros (TDD ligero, validar comportamiento). 
3. `app.js`: refactor tarjeta para usar función pura; añadir gestión objetivo. 
4. `index.html`: añadir bloque objetivo. 
5. `styles.css`: añadir estilos accesibles/responsive. 
6. Verificar integración manual y `node --test`.
