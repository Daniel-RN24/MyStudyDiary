- [x] **T1. Extraer función pura de minutos semanales a `logic.js`.** RF-2
  - Hecho cuando: Existe `sumMinutesInWeek(sessions, today)` en `logic.js`. Usa `mondayOfWeek`/`addDays`. Suma todas las sesiones de la semana lunes–domingo que contiene `today`, excluye fechas > hoy, ignora minutos no numéricos, no finitos, 0 o negativos; los decimales positivos se suman con su valor. No accede a DOM ni localStorage.

- [x] **T2. Añadir helpers/validación de objetivo en `logic.js`.** RF-1, RF-3, RF-4
  - Hecho cuando: Existen `isValidWeeklyGoal(v)`, `parseWeeklyGoal(raw)` y `weeklyGoalProgress(goal, minutesInWeek)`. Objetivo debe ser entero positivo. `weeklyGoalProgress` devuelve porcentaje topeado al 100%, minutos restantes, estados (`sin-objetivo`/`en-curso`/`conseguido`/`por-encima`) y textos en español. Código puro, sin DOM/localStorage.

- [x] **T3. Cubrir tests puros en `logic.test.js`.** RF-2, RF-3, RF-4
  - Hecho cuando: Se añaden tests con `node --test` para `sumMinutesInWeek` (límites lunes/domingo, fuera de semana, futuras, varias sesiones mismo día, minutos inválidos/decimales, sesiones sin fecha) y para `weeklyGoalProgress`/validación (sin objetivo, en curso, conseguido, por encima, tope 100%, minutos restantes). Todos pasan.

- [x] **T4. Refactorizar `app.js` para usar la función pura compartida.** RF-2, RF-5
  - Hecho cuando: La tarjeta "Minutos esta semana" utiliza `sumMinutesInWeek(sessions, today)` (inyectando "hoy"). No queda lógica duplicada para el cálculo semanal. Comportamiento idéntico con datos válidos.

- [x] **T5. Añadir persistencia del objetivo (lectura/escritura tolerante).** RF-6, RF-7
  - Hecho cuando: Se lee/escribe la clave `diario-estudio-objetivo-semanal` con try/catch. Datos ausentes/corruptos se tratan como sin objetivo. Nunca se modifica `diario-estudio-sesiones`.

- [x] **T6. Modificar HTML: bloque de objetivo junto a la tarjeta existente.** RF-1, RF-3, RF-8
  - Hecho cuando: En `index.html` existe un bloque accesible (etiquetas asociadas, roles adecuados) con formulario para fijar/cambiar objetivo, botón "Quitar objetivo" cuando procede, texto "X / Y min", barra de progreso con `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` válido (topeado), colocado junto a la tarjeta "Minutos esta semana" sin sustituirla.

- [x] **T7. Estilos CSS para objetivo (responsive y legible).** RF-3, RNF
  - Hecho cuando: `styles.css` añade estilos para el bloque, barra de progreso legible, estados visibles y coherentes con el diseño. Funciona bien en móvil. Sin alterar estilos existentes innecesariamente.

- [x] **T8. Lógica UI del objetivo en `app.js` (estado, validación con mensaje visible/accesible).** RF-1, RF-3, RF-4, RF-5, RF-8
  - Hecho cuando: Muestra/oculta formulario según estado, valida objetivo entero positivo con mensaje visible y accesible, gestiona fijar/cambiar/quitar, muestra estados/textos y felicitación/aviso según corresponda, y se actualiza automáticamente al registrar sesión sin recargar (recalcula con "hoy").

- [x] **T9. Pruebas manuales de integración (navegador) y casos límite.** RF-7, RNF
  - Hecho cuando: Probados casos: sin objetivo, datos corruptos en localStorage, objetivo cambiado/quitado, varias sesiones mismo día, semana cambia (lunes), fechas futuras no afectan, actualización tras registrar, UI responsive/accesible.

- [x] **T10. Verificación final y coherencia con la spec.** Todos los RF
  - Hecho cuando: `node --test` pasa (incluyendo nuevos tests). Se verifica que solo se usa clave propia, no se toca formato de sesiones, se respeta uso de fechas locales, textos en español, sin dependencias/build. `MEMORY.md` actualizado al terminar (regla del proyecto). Cambios limitados al alcance.

