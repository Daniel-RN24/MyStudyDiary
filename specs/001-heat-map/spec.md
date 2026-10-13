# Spec 001 — Mapa de calor de días estudiados

## Contexto y objetivo
El Diario de Estudio ya registra sesiones (fecha, tema, minutos) y resume el progreso con
la racha actual, la mejor racha, los minutos de la semana y los días estudiados del mes.
Esos números dicen *cuánto*, pero no permiten *ver de un vistazo* la constancia a lo
largo del tiempo.

Esta funcionalidad añade un **mapa de calor** tipo calendario en el que cada día es una
celda: los días sin estudio se ven neutros y los días estudiados se colorean con más
intensidad cuantos más minutos se acumulen. El objetivo es que el usuario perciba su
constancia y se motive al ver el histórico completo de su esfuerzo, sin necesidad de
leer cifras.

## Usuarios
- **Estudiante que registra sesiones**: quiere ver su constancia en el tiempo y sentirse
  motivado por los días coloreados.
- **Usuario que empieza**: todavía no tiene sesiones; necesita un mensaje claro que le
  invite a empezar.

## Historias de usuario
- **HU-1**: Como estudiante, quiero ver un calendario donde los días que he estudiado
  estén coloreados, para comprobar de un vistazo mi constancia.
- **HU-2**: Como estudiante, quiero que un día con más minutos se vea más intenso que uno
  con menos, para percibir mi esfuerzo relativo.
- **HU-3**: Como estudiante, quiero consultar cuántos minutos estudié un día concreto,
  para recordar qué hice ese día.
- **HU-4**: Como estudiante nuevo, quiero un mensaje que me invite a registrar mi primera
  sesión en lugar de un calendario vacío.
- **HU-5**: Como estudiante en el móvil, quiero ver y recorrer el mapa sin que se rompa
  la pantalla, para consultarlo desde el teléfono.

## Requisitos funcionales

### RF-1 — Mostrar el mapa de calor
El sistema deberá mostrar un mapa de calor con una celda por día, organizado en semanas
(columnas) y días de la semana (filas).
- Cuando el sistema disponga de al menos una sesión con fecha válida y no futura, el
  sistema deberá dibujar el mapa de calor.
- El sistema deberá asignar una fila por cada día de la semana, de lunes a domingo, y una
  columna por cada semana; cada semana empezará en lunes y terminará en domingo.
- Mientras no exista ninguna sesión con fecha válida y no futura, el sistema deberá
  mostrar el estado vacío de RF-7 en lugar del mapa.

### RF-2 — Alcance temporal: todo el histórico
El sistema deberá cubrir todo el histórico de sesiones válidas y no futuras.
- El sistema deberá comenzar el mapa en el lunes de la semana a la que pertenece la sesión
  válida y no futura más antigua (por fecha, no por orden de creación).
- El sistema deberá terminar el mapa en el domingo de la semana que contiene la fecha de
  hoy.
- El sistema deberá mostrar la semana actual completa, incluidos los días posteriores a
  hoy, que se pintan según RF-5.
- Las sesiones con fecha futura no deberán determinar ni el inicio ni el fin del rango.
- El sistema deberá determinar "hoy" en el momento de dibujar o actualizar el mapa; no se
  exige un refresco automático al cambiar de fecha con la aplicación abierta.

### RF-3 — Intensidad según minutos
El sistema deberá colorear cada día en función del total de minutos estudiados ese día,
usando niveles fijos.
- El sistema deberá sumar los minutos de todas las sesiones válidas del mismo día antes de
  decidir el color.
- El sistema deberá representar los días sin sesión con la intensidad mínima (nivel 0,
  color neutro).
- El sistema deberá aplicar un nivel de intensidad creciente con estos umbrales, contando
  el valor límite en el nivel superior: nivel 1 (1 a 29 min), nivel 2 (30 a 59 min),
  nivel 3 (60 a 119 min) y nivel 4 (120 min o más).
- Si el total del día no es un número positivo (0, negativo, ausente o inválido), el
  sistema deberá tratarlo como día sin estudio (nivel 0).
- El sistema deberá mantener la escala fija: el mismo total de minutos deberá producir
  siempre el mismo nivel, con independencia del resto del histórico.

### RF-4 — Consultar el detalle de un día
El sistema deberá mostrar el detalle de un día al pasar el ratón por encima, al tocarlo o
al enfocarlo con el teclado.
- Cuando el usuario pasa el ratón sobre una celda de un día no futuro, el sistema deberá
  mostrar la fecha, el total de minutos estudiados y los temas de ese día.
- Cuando el usuario toca una celda de un día no futuro en un dispositivo táctil, el
  sistema deberá mostrar el mismo detalle que al pasar el ratón.
- Cuando el usuario enfoca una celda de un día no futuro con el teclado, el sistema deberá
  mostrar el mismo detalle que al pasar el ratón.
- El sistema deberá mostrar la fecha con año (por ejemplo, "lunes, 5 de octubre de 2026").
- Si el día no tiene sesiones, el sistema deberá indicar que no hubo estudio ese día.
- El sistema deberá mostrar un solo detalle a la vez y mantenerlo dentro de los límites de
  la pantalla.
- El sistema deberá ocultar el detalle cuando el puntero sale de la celda, cuando la celda
  pierde el foco, al pulsar Escape o al interactuar con otra celda.
- Mientras el día sea futuro, el sistema no deberá mostrar detalle (ver RF-5).

### RF-5 — Excluir el futuro
El sistema deberá tratar los días posteriores a hoy como días sin datos.
- El sistema deberá ignorar cualquier sesión con fecha posterior a hoy al calcular la
  intensidad de un día y al determinar el rango.
- Mientras una celda corresponda a un día futuro, el sistema deberá mostrarla con un
  aspecto de "sin datos" distinto del nivel 0 y sin detalle interactivo.

### RF-6 — Leyenda y etiquetas
El sistema deberá ayudar a interpretar el mapa.
- El sistema deberá mostrar una leyenda que relacione los colores con los niveles y sus
  rangos de minutos ("sin estudio", "1–29", "30–59", "60–119", "120+"), además del estado
  "sin datos".
- El sistema deberá mostrar etiquetas de mes a lo largo de la parte superior del mapa; la
  primera etiqueta y las de enero deberán incluir el año para evitar ambigüedad.
- El sistema deberá mostrar referencias de los días de la semana junto a las filas del
  mapa (por ejemplo, lun, mié, vie).

### RF-7 — Estado vacío
El sistema deberá mostrar un mensaje de estado vacío cuando no haya ninguna sesión.
- Mientras no exista ninguna sesión con fecha válida y no futura, el sistema deberá
  mostrar un mensaje que invite a registrar la primera sesión, en lugar del mapa de calor.
- Mientras se muestre el estado vacío, el sistema no deberá mostrar la leyenda ni las
  etiquetas del mapa.

### RF-8 — Recorrer el histórico largo
El sistema deberá permitir consultar históricos extensos sin perder contenido.
- Cuando el mapa ocupe más ancho que su contenedor, el sistema deberá permitir desplazarlo
  horizontalmente sin desplazar el resto de la página.
- El sistema deberá mantener la alineación entre celdas, etiquetas de mes y referencias de
  días mientras se desplaza.
- Cuando se abra el mapa con un histórico que desborde, el sistema deberá posicionarse en
  el extremo más reciente (hoy).
- Cuando el usuario registre una sesión estando desplazado, el sistema deberá conservar la
  posición de desplazamiento.

### RF-9 — Actualización tras registrar
El sistema deberá reflejar de inmediato las sesiones nuevas.
- Cuando el usuario registre una sesión, el sistema deberá recalcular y redibujar el mapa
  de calor sin recargar la página, aplicando RF-8.

### RF-10 — Robustez de los datos
El sistema deberá tolerar datos incompletos o inválidos sin romperse ni perder sesiones.
- El sistema deberá ignorar, a efectos del mapa, las entradas sin fecha o con una fecha con
  formato inválido.
- Si los datos guardados estuvieran corruptos o no pudieran interpretarse, el sistema
  deberá mostrar el estado vacío de RF-7 sin borrar ni modificar lo almacenado.

## Requisitos no funcionales
- **RNF-1 — Simplicidad**: la funcionalidad debe integrarse sin añadir dependencias,
  frameworks ni pasos de build, y debe funcionar abriendo el proyecto directamente con
  doble clic.
- **RNF-2 — Lógica separada**: el cálculo de los minutos por día, del nivel de color y del
  rango de fechas debe residir en funciones puras que reciban "hoy" como dato, sin depender
  del DOM ni del almacenamiento.
- **RNF-3 — Fechas locales**: todos los cálculos de días y semanas deben usar la fecha
  local del usuario; nunca UTC.
- **RNF-4 — Compatibilidad**: debe funcionar con los datos ya guardados, sin modificarlos
  ni perder ninguna sesión.
- **RNF-5 — Responsive**: el mapa debe verse y usarse bien en el móvil, sin provocar
  desbordamiento horizontal de la página (el desplazamiento de RF-8 es interno al mapa) y
  debe seguir siendo usable con zoom del navegador o tamaño de fuente aumentado.
- **RNF-6 — Rendimiento**: el mapa debe mantenerse fluido con históricos de varios años.
- **RNF-7 — Idioma**: todos los textos de la interfaz en español.
- **RNF-8 — Accesibilidad**: el detalle de un día debe poder consultarse con el teclado y
  los colores no deben ser el único medio de transmitir el valor del día.
- **RNF-9 — Tests**: la nueva lógica pura (minutos por día, nivel de color y rango de
  fechas) debe cubrirse con pruebas ejecutables mediante `node --test`, conforme al
  principio 4 de la constitución.

## Casos límite
- No hay ninguna sesión (estado vacío de RF-7).
- Las únicas sesiones registradas tienen fecha futura: se aplica el estado vacío.
- Solo existe una sesión.
- El histórico abarca varios meses o varios años.
- Totales diarios justo en los límites de nivel (29 y 30, 59 y 60, 119 y 120).
- Sesiones con minutos 0, negativos, decimales o en texto: se tratan como día sin estudio.
- Datos guardados corruptos o no interpretables: estado vacío sin borrar datos (RF-10).
- Entradas con fecha con formato inválido o imposible: se ignoran en el mapa.
- La aplicación queda abierta y cambia la fecha: "hoy" se fija al dibujar o actualizar.
- Años con 53 semanas, cambios de año a mitad de semana y años bisiestos (29 de febrero).
- La primera sesión cae en domingo: la primera columna tiene un solo día con datos.
- Todo el histórico cabe en una sola semana.
- Muchísimas sesiones o temas en un mismo día: el detalle debe seguir siendo legible.
- El detalle aparece sobre la primera/última columna o en la fila superior/inferior.
- Cambios de zona horaria o de hora estacional (DST) entre sesiones: se usan fechas locales.
- Sesiones futuras mezcladas con pasadas: las futuras se excluyen del rango y del color.
- Se registra una sesión mientras el mapa está desplazado: se conserva la posición.

## Fuera de alcance
- Editar o eliminar sesiones.
- Filtrar, paginar, hacer zoom o navegar por rangos (mes/año) dentro del mapa.
- Elegir el rango temporal mostrado (esta versión siempre cubre todo el histórico).
- Cambiar la escala de intensidad o personalizar los colores.
- Exportar o compartir el mapa como imagen.
- Refresco automático a medianoche con la aplicación abierta.
- Cambiar los cálculos existentes de racha, mejor racha, minutos de la semana o días del
  mes.
- Enlazar el clic de un día con la lista de sesiones existente.

## Criterios de finalización
- El mapa de calor aparece cuando hay al menos una sesión válida y no futura, y muestra el
  mensaje de estado vacío en caso contrario (incluidas las sesiones solo futuras).
- Cada día se colorea según el total de minutos y la escala acordada, con un color neutro
  para los días sin estudio y un aspecto distinto para los días futuros ("sin datos").
- Varias sesiones del mismo día se consolidan en una sola celda con la suma de minutos.
- El detalle de un día se muestra al pasar el ratón, al tocar y con el teclado, con fecha
  con año, total de minutos y temas, y permanece dentro de la pantalla.
- Los días futuros quedan como "sin datos" y no participan en el cálculo ni en el detalle.
- El mapa se desplaza horizontalmente cuando el histórico es largo, arranca en la fecha más
  reciente y conserva la posición al registrar.
- El mapa se actualiza al registrar una sesión nueva, sin recargar la página.
- Tolerar datos inválidos o corruptos sin romperse ni perder sesiones.
- La lógica pura nueva está cubierta por tests que pasan con `node --test`.
- Todo funciona en local abriendo el proyecto directamente, sin dependencias.
- Se verifica en el navegador, incluida la vista móvil (por ejemplo, 375 px de ancho) y con
  zoom o fuente aumentada, sin errores en la consola.
- Todos los textos visibles están en español.

## Dudas abiertas
- Ninguna por ahora. Las decisiones se han cerrado en los requisitos anteriores.
