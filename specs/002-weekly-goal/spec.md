# Spec 002 — Objetivo semanal de estudio
Estado: implementada

## Contexto y objetivo
El Diario de Estudio registra sesiones (fecha, tema, minutos) y ya resume el progreso con la
racha actual, la mejor racha, los minutos de la semana y los días estudiados del mes. Esos
números dicen *cuánto* se ha estudiado, pero no existe una **meta** contra la que compararse:
sin un objetivo, el usuario no sabe si su semana ha sido suficiente.

Esta funcionalidad permite **fijar cuántos minutos se quiere estudiar cada semana** y ver el
**progreso hacia ese objetivo**. El objetivo es motivacional: convertir una cifra suelta de
minutos en una meta concreta y un avance visible ("llevo 120 de 300 min") que invite a
seguir estudiando hasta cumplirla.

La semana se entiende igual que en el resto de la aplicación: de lunes a domingo, la semana
que contiene la fecha de hoy, con las fechas siempre en hora local y sin contar días futuros.

## Usuarios
- **Estudiante con constancia**: quiere marcarse una meta semanal y comprobar si la cumple,
  para mantenerse motivado.
- **Estudiante que empieza**: todavía no ha fijado un objetivo; necesita un punto claro desde
  el que fijar uno.

## Historias de usuario
- **HU-1**: Como estudiante, quiero fijar cuántos minutos quiero estudiar cada semana, para
  tener una meta concreta.
- **HU-2**: Como estudiante, quiero ver cuántos minutos llevo de mi objetivo semanal, para
  saber si voy por buen camino.
- **HU-3**: Como estudiante, quiero saber cuándo he cumplido (o superado) mi objetivo semanal,
  para sentirme motivado a mantenerlo.
- **HU-4**: Como estudiante, quiero cambiar mi objetivo semanal cuando mi disponibilidad
  cambie, para que la meta siga siendo realista.
- **HU-5**: Como estudiante nuevo, quiero que la aplicación me invite a fijar un objetivo en
  lugar de mostrar cifras confusas, para saber cómo empezar.
- **HU-6**: Como estudiante en el móvil, quiero ver y fijar mi objetivo sin que se rompa la
  pantalla, para consultarlo desde el teléfono.

## Definiciones
- **Semana**: la semana natural de lunes a domingo que contiene la fecha de hoy. Es la misma
  definición que ya usa la métrica "Minutos esta semana".
- **Objetivo semanal**: cantidad de minutos de estudio que el usuario quiere alcanzar cada
  semana. Se expresa en minutos enteros positivos. Es un valor único y recurrente: se mantiene
  semana tras semana hasta que el usuario lo cambie o lo quite.
- **Minutos acumulados de la semana**: suma de los minutos de todas las sesiones cuya fecha
  cae dentro de la semana en curso, excluyendo las fechas futuras. Se obtiene de la misma fuente
  única que la métrica "Minutos esta semana" ya existente, por lo que ambas cifras coinciden.
- **Progreso**: relación entre los minutos acumulados de la semana y el objetivo semanal.

## Requisitos funcionales

### RF-1 — Fijar el objetivo semanal
El sistema deberá permitir al usuario fijar un objetivo de minutos de estudio por semana.
- EL SISTEMA deberá aceptar como objetivo únicamente un número entero positivo de minutos; los
  decimales y el texto no se aceptan.
- CUANDO el usuario fije un objetivo válido, EL SISTEMA deberá guardarlo y mostrar el progreso
  actualizado sin recargar la página.
- SI el valor introducido no es un entero positivo (vacío, cero, negativo, decimal o texto),
  ENTONCES EL SISTEMA deberá rechazarlo, no modificar el objetivo vigente y mostrar un mensaje
  visible y accesible indicando que el objetivo debe ser un número entero de minutos mayor que
  cero.
- CUANDO el usuario fije un objetivo a mitad de semana, EL SISTEMA deberá aplicarlo a la
  semana en curso completa (desde el lunes), no solo a los días posteriores.
- EL SISTEMA deberá tratar el objetivo como un valor único y recurrente: el mismo objetivo se
  aplica a la semana en curso y a las siguientes hasta que el usuario lo cambie o lo quite, sin
  pedir que se vuelva a fijar al empezar una semana nueva.

### RF-2 — Calcular el progreso con la semana existente
El sistema deberá medir el progreso sobre la misma semana que el resto de la aplicación.
- EL SISTEMA deberá medir el progreso sobre la semana que contiene la fecha de hoy, de lunes a
  domingo.
- EL SISTEMA deberá calcular los minutos acumulados con los mismos criterios que "Minutos esta
  semana": se suman todas las sesiones de la semana (no se usan días únicos).
- El sistema deberá usar una única función pura como fuente única de los minutos de la semana,
  que reciba "hoy" como dato; la tarjeta "Minutos esta semana" y el progreso del objetivo
  deberán tomar su cifra de esa misma función, de modo que nunca muestren cantidades distintas.
- El sistema deberá sumar al total todas las sesiones del mismo día.
- El sistema deberá contar en el total solo las sesiones cuyos minutos sean un número finito
  mayor que cero; deberá ignorar las sesiones con minutos no numéricos (texto), no finitos
  (como NaN o Infinity), cero o negativos. Los decimales positivos se suman con su valor.
- El sistema deberá excluir del total las sesiones con fecha futura dentro de la semana.
- El sistema deberá excluir del total las sesiones de semanas anteriores o posteriores.

### RF-3 — Mostrar el progreso
El sistema deberá mostrar el progreso hacia el objetivo semanal de forma verificable.
- CUANDO exista un objetivo válido, EL SISTEMA deberá mostrar los minutos acumulados de la
  semana y el valor del objetivo con el formato "X / Y min", donde X son los minutos
  acumulados e Y el objetivo.
- CUANDO exista un objetivo válido, EL SISTEMA deberá mostrar una barra de progreso que
  represente visualmente la proporción de minutos acumulados sobre el objetivo, sin superar
  visualmente el 100% aunque los minutos acumulados excedan el objetivo.
- El sistema deberá mostrar el progreso aunque todavía no haya ninguna sesión esta semana
  (0 minutos acumulados), en cuyo caso la barra de progreso aparece vacía.
- MIENTRAS los minutos acumulados sean menores que el objetivo, EL SISTEMA deberá mostrar
  además el texto "te faltan Z min", donde Z son los minutos que faltan para alcanzar el
  objetivo.
- El sistema deberá mostrar siempre una etiqueta textual con el estado del objetivo ("En
  curso" mientras no se alcanza; "Conseguido" al alcanzarlo o superarlo), de modo que el estado
  se entienda sin depender únicamente del color.
- El sistema deberá añadir la vista del objetivo junto a la tarjeta "Minutos esta semana" (sin
  sustituirla) y reutilizar su misma cifra de minutos, sin duplicar cálculos ni mostrar dos
  cantidades distintas para la misma semana.

### RF-4 — Estado de consecución
El sistema deberá comunicar si el objetivo semanal se ha cumplido, con refuerzo positivo.
- MIENTRAS los minutos acumulados de la semana sean menores que el objetivo, EL SISTEMA deberá
  mostrar la etiqueta textual "En curso" y el texto "te faltan Z min" de RF-3.
- CUANDO los minutos acumulados de la semana alcancen el objetivo, EL SISTEMA deberá mostrar la
  etiqueta textual "Conseguido" y un mensaje de felicitación indicando que ha alcanzado justo el
  objetivo.
- CUANDO los minutos acumulados de la semana superen el objetivo, EL SISTEMA deberá mantener la
  etiqueta textual "Conseguido" con el mensaje de felicitación e indicar de forma explícita,
  además, que va por encima del objetivo, diferenciándolo del caso de haberlo alcanzado justo.
- El sistema deberá distinguir el estado "conseguido" (alcanzado o superado) del estado "aún no
  alcanzado" mediante la etiqueta textual anterior, sin basarse solo en el color.

### RF-5 — Actualizar el progreso al registrar
El sistema deberá reflejar de inmediato las sesiones nuevas.
- CUANDO el usuario registre una sesión, EL SISTEMA deberá recalcular y actualizar el progreso
  del objetivo sin recargar la página.

### RF-6 — Persistencia y compatibilidad
El sistema deberá conservar el objetivo sin poner en riesgo los datos existentes.
- El sistema deberá conservar el objetivo fijado entre visitas (al cerrar y volver a abrir la
  aplicación).
- El sistema deberá guardar el objetivo en una clave de almacenamiento propia e independiente
  de la de sesiones (`diario-estudio-objetivo-semanal`), con un formato simple (el valor de
  minutos), sin tocar la clave de sesiones (`diario-estudio-sesiones`) ni el formato de las
  sesiones.
- El sistema deberá guardar el objetivo sin modificar ni perder las sesiones ya guardadas ni su
  formato actual.

### RF-7 — Estado sin objetivo y robustez
El sistema deberá funcionar correctamente aunque no haya un objetivo utilizable.
- MIENTRAS no exista un objetivo válido fijado, EL SISTEMA deberá mostrar un estado que invite
  a fijar uno y no deberá mostrar cifras de progreso ni estados de consecución.
- SI el objetivo guardado no es un número entero positivo (cero, negativo, decimal, texto,
  ausente o ilegible), ENTONCES EL SISTEMA deberá tratarlo como si no hubiera objetivo.
- SI los datos guardados estuvieran corruptos o no pudieran interpretarse, ENTONCES EL SISTEMA
  deberá seguir funcionando sin borrar ni modificar lo almacenado.

### RF-8 — Cambiar o quitar el objetivo
El sistema deberá permitir ajustar el objetivo a lo largo del tiempo.
- CUANDO el usuario cambie el objetivo, EL SISTEMA deberá aplicar el nuevo valor de inmediato y
  recalcular el progreso.
- CUANDO el usuario quite el objetivo, EL SISTEMA deberá volver al estado sin objetivo de RF-7
  conservando las sesiones ya guardadas.

## Requisitos no funcionales
- **RNF-1 — Simplicidad**: la funcionalidad debe integrarse sin añadir dependencias, frameworks
  ni pasos de build, y debe funcionar abriendo el proyecto directamente con doble clic.
- **RNF-2 — Lógica separada**: el cálculo de los minutos de la semana debe residir en una única
  función pura que reciba "hoy" como dato, y el cálculo del progreso y del estado de
  consecución en funciones puras que reciban "hoy" y el objetivo, todas sin depender de la
  interfaz ni del almacenamiento.
- **RNF-3 — Fechas locales**: todos los cálculos de días y semanas deben usar la fecha local
  del usuario; nunca UTC, ni `toISOString()`, ni `new Date("AAAA-MM-DD")`.
- **RNF-4 — Compatibilidad**: debe funcionar con los datos ya guardados, sin modificarlos ni
  perder ninguna sesión.
- **RNF-5 — Responsive**: la funcionalidad debe verse y usarse bien en el móvil y seguir siendo
  usable con zoom del navegador o tamaño de fuente aumentado.
- **RNF-6 — Accesibilidad**: los estados del objetivo no deben transmitirse solo por color (se
  apoyan en las etiquetas textuales "En curso"/"Conseguido"), los controles para fijar, cambiar
  y quitar el objetivo deben tener etiqueta asociada, la barra de progreso debe exponer su valor
  de forma legible por un lector de pantalla con un rango válido (el valor nunca supera el
  máximo aunque los minutos acumulados excedan el objetivo) y los mensajes de progreso, de
  rechazo y de consecución deben ser anunciables.
- **RNF-7 — Idioma**: todos los textos de la interfaz en español.
- **RNF-8 — Tests**: la nueva lógica pura (progreso y estado del objetivo) debe cubrirse con
  pruebas ejecutables mediante `node --test`, conforme al principio 4 de la constitución.

## Casos límite
- No hay ningún objetivo fijado (estado sin objetivo de RF-7).
- Objetivo guardado inválido (0, negativo, decimal, texto, ausente o ilegible): se trata como
  ausente sin borrar datos (RF-7).
- Hay objetivo pero no hay ninguna sesión esta semana: progreso de 0 minutos.
- Los minutos acumulados igualan exactamente el objetivo (alcanzado justo).
- Los minutos acumulados superan el objetivo: la barra no rebasa visualmente el 100% y su valor
  accesible se mantiene dentro de su rango (sin superar el máximo).
- Objetivo muy pequeño (por ejemplo, 1 o 5 minutos) y objetivo muy grande (por ejemplo,
  varios miles de minutos).
- Se introduce un objetivo decimal o de texto: se rechaza con un mensaje visible y accesible y
  el objetivo vigente no cambia.
- El objetivo se fija a mitad de semana: el progreso cuenta desde el lunes.
- Sesiones futuras dentro de la semana en curso (por ejemplo, un domingo futuro): no cuentan.
- Sesiones de semanas anteriores o posteriores a la semana en curso: no cuentan.
- Varias sesiones el mismo día: sus minutos se suman al progreso.
- Sesiones con minutos no numéricos (texto), no finitos (NaN, Infinity), cero o negativos: se
  ignoran; los decimales positivos se suman con su valor, igual que en la métrica "Minutos esta
  semana".
- La tarjeta "Minutos esta semana" y el progreso del objetivo muestran siempre la misma cifra de
  minutos de la semana.
- Se registra una sesión con el objetivo ya alcanzado: el progreso se actualiza por encima del
  objetivo.
- La aplicación queda abierta y cambia la semana (medianoche del domingo al lunes): "hoy" se
  fija al dibujar o actualizar; no se exige refresco automático.
- Cambios de zona horaria o de hora estacional (DST) entre sesiones: se usan fechas locales.
- Datos corruptos en el almacenamiento: la aplicación sigue funcionando sin borrarlos (RF-7).
- El usuario quita el objetivo teniendo sesiones registradas: las sesiones se conservan.
- El usuario cambia el objetivo varias veces seguidas: solo cuenta el último valor.

## Fuera de alcance
- Objetivos por día, por mes o por asignatura/tema.
- Recordatorios o notificaciones para cumplir el objetivo.
- Logros, insignias o recompensas más allá de indicar que el objetivo se ha conseguido.
- Historial de objetivos anteriores o estadísticas de cumplimiento de semanas pasadas.
- Comparar el objetivo con semanas anteriores o con otros usuarios.
- Editar o eliminar sesiones.
- Sincronización entre dispositivos o cualquier forma de backend.
- Cambiar el resultado de los cálculos existentes de racha, mejor racha, minutos de la semana o
  días del mes. (Unificar los minutos de la semana en una única función pura, sin cambiar el
  resultado para datos válidos, no es cambiar el cálculo: es el medio previsto para cumplir
  RF-2.)

## Criterios de finalización
- Se puede fijar un objetivo semanal en minutos y solo se aceptan enteros positivos; un valor
  decimal o de texto se rechaza con un mensaje visible y accesible, sin alterar el objetivo
  vigente.
- El objetivo es un valor único y recurrente: se mantiene al pasar a una semana nueva sin pedir
  que se vuelva a fijar.
- El progreso mostrado corresponde a los minutos de la semana en curso (lunes a domingo),
  calculados igual que "Minutos esta semana" y excluyendo fechas futuras.
- Los minutos de la semana salen de una única fuente pura, de modo que la tarjeta "Minutos esta
  semana" y el progreso del objetivo nunca muestran cifras distintas; las sesiones con minutos
  no numéricos, no finitos, cero o negativos se ignoran, y los decimales positivos se suman con
  su valor.
- Con un objetivo válido se muestra "X / Y min", una barra de progreso, la etiqueta textual de
  estado ("En curso"/"Conseguido") y, mientras no se alcanza, el texto "te faltan Z min".
- Al alcanzar el objetivo se muestra el estado "Conseguido" con un mensaje de felicitación; al
  superarlo, se indica explícitamente que va por encima del objetivo, diferenciándolo de haberlo
  alcanzado justo, y la barra no rebasa el 100% ni su valor accesible supera el máximo.
- El progreso se actualiza al registrar una sesión, sin recargar la página.
- El objetivo se conserva entre visitas en su propia clave (`diario-estudio-objetivo-semanal`) y
  no altera las sesiones ni su formato.
- Sin objetivo válido, se muestra un estado que invita a fijar uno; los datos inválidos o
  corruptos no rompen la aplicación ni borran datos.
- El objetivo se puede cambiar por otro valor y también quitar, volviendo al estado sin objetivo
  y conservando las sesiones.
- La lógica pura nueva está cubierta por tests que pasan con `node --test`.
- Todo funciona en local abriendo el proyecto directamente, sin dependencias.
- Se verifica en el navegador, incluida la vista móvil y con zoom o fuente aumentada, sin
  errores en la consola.
- Todos los textos visibles están en español.

## Dudas abiertas
- Ninguna pendiente. Las decisiones acordadas quedan recogidas en RF-1 a RF-8 y en los criterios
  de finalización: objetivo único y recurrente; progreso "X / Y min" con barra y "te faltan
  Z min"; etiquetas textuales "En curso"/"Conseguido"; felicitación al cumplir y aviso de "por
  encima"; objetivo opcional, cambiable y eliminable; minutos inválidos ignorados en una única
  fuente compartida con la tarjeta "Minutos esta semana"; y objetivo guardado en su propia clave.
