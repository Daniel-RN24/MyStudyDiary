# AGENTS.md — Diario de Estudio
Web estática para registrar sesiones de estudio y motivarse viendo la racha de días
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a
programar.
## Stack y estructura
- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (interfaz y persistencia),
`logic.js` (lógica pura: fechas y cálculos, sin DOM ni localStorage).
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES
(`type="module"`), `fetch` a archivos locales ni nada que requiera servidor.
- `logic.js` se carga como script normal y expone globales en el navegador; en Node se
requiere por CommonJS para los tests (mismo archivo, sin build).
## Convenciones
- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.
## Datos
- localStorage, clave `diario-estudio-sesiones`: array de `{ fecha: "AAAA-MM-DD", tema,
minutos, creadaEn }`.
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario
perderá sus sesiones.
## Fechas y racha (fácil equivocarse)
- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new
Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión
pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman.
- **Mejor racha**: máxima longitud de días consecutivos con al menos 1 sesión (histórica). Se calcula sobre días únicos con sesión, excluyendo fechas futuras (`<= hoy`), ordenados cronológicamente y agrupados en corridas consecutivas (diferencia +1 día). Usa los mismos helpers locales (`localDate`, `addDays`, en `logic.js`). No depende de que la corrida termine hoy.

## Métricas
- **Minutos esta semana**: suma total de minutos de todas las sesiones con fecha dentro de la semana que contiene hoy. Inicio de semana = lunes; fin = domingo. Se incluyen los límites (lunes y domingo). Se suman todas las sesiones (no se usan días únicos), se excluyen fechas futuras (`> hoy`) y se usa `finEfectivo = min(finSemana, hoy)`. Usa `localDate`, `addDays`, `mondayOfWeek` y `Date` local para obtener el día de la semana.
- **Días estudiados este mes**: cantidad de días únicos con al menos 1 sesión cuyo texto de fecha pertenece al mes actual. Se comparan los prefijos `AAAA-MM` (`fecha.slice(0, 7)`) en lugar de construir la fecha del último día del mes: el texto se compara bien como texto y no depende de la longitud del mes. Se excluyen fechas futuras (`> hoy`) y las entradas sin `fecha`. Varias sesiones el mismo día cuentan como un solo día.
## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.
## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).
## Comandos
- Tests: `node --test`
## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.
## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.
## Verificación
- Tests de lógica con `node --test` (los corren sobre `logic.js` con CommonJS).
- Probar la interfaz abriendo `index.html` en el navegador.
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave
`diario-estudio-sesiones`.